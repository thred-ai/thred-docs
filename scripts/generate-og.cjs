const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const YAML = require('yaml');

const root = path.resolve(__dirname, '..');
const fontfile = path.join(__dirname, 'assets/InstrumentSans.ttf');
const read = (file) => fs.readFile(path.join(root, file), 'utf8');
const escape = (text) => text.replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
})[char]);

async function textLayer(text, size, color, maxHeight, weight = '') {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  for (let count = words.length; count > 0; count--) {
    const content = words.slice(0, count).join(' ') + (count < words.length ? '…' : '');
    const image = sharp({ text: {
      text: `<span foreground="${color}">${escape(content)}</span>`,
      font: `Instrument Sans ${weight} ${size}`,
      fontfile,
      width: 1056,
      rgba: true,
      spacing: 8,
    } });
    const { data, info } = await image.png().toBuffer({ resolveWithObject: true });
    if (info.height <= maxHeight) return { data, height: info.height };
  }
  throw new Error(`Text does not fit: ${text}`);
}

async function main() {
  const config = JSON.parse(await read('docs.json'));
  const logo = await sharp(Buffer.from(await read('logo/thred.svg')), { density: 300 })
    .resize({ height: 176 }).png().toBuffer();
  let count = 0;

  for (const group of config.navigation.groups) {
    for (const page of group.pages) {
      const source = await read(`${page}.mdx`);
      const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!match) throw new Error(`Missing frontmatter: ${page}`);
      const metadata = YAML.parse(match[1]);
      let description = metadata['og:description'] ?? metadata.description;
      if (!description && metadata.openapi) {
        const [file, method, route] = metadata.openapi.split(' ');
        const spec = JSON.parse(await read(file));
        description = spec.paths[route][method.toLowerCase()].description;
      }
      if (!description) throw new Error(`Missing page description: ${page}`);
      description = description.replace(/`([^`]+)`/g, '$1');

      const eyebrow = await textLayer(group.group, 24, '#3AA4C1', 36);
      const title = await textLayer(metadata.title, 64, '#F5F5F5', 148, 'SemiBold');
      const descriptionTop = 330 + title.height + 30;
      const detail = await textLayer(description, 30, '#B5B5B5', 558 - descriptionTop);
      const output = `images/og/${page}.png`;
      await fs.mkdir(path.dirname(path.join(root, output)), { recursive: true });
      await sharp({ create: {
        width: 1200, height: 630, channels: 3, background: '#1D1D1D',
      } }).composite([
        { input: logo, left: 72, top: 64 },
        { input: eyebrow.data, left: 72, top: 281 },
        { input: title.data, left: 72, top: 330 },
        { input: detail.data, left: 72, top: descriptionTop },
      ]).png({ compressionLevel: 9 }).toFile(path.join(root, output));

      const imageUrl = `https://www.thred.dev/${output}`;
      const alt = `Thred documentation: ${metadata.title}`;
      const frontmatter = match[1]
        .split('\n')
        .filter((line) => !/^"?(?:og:image|og:image:alt|twitter:image:alt)"?:/.test(line))
        .join('\n');
      const social = [
        `"og:image": ${JSON.stringify(imageUrl)}`,
        `"og:image:alt": ${JSON.stringify(alt)}`,
        `"twitter:image:alt": ${JSON.stringify(alt)}`,
      ].join('\n');
      await fs.writeFile(path.join(root, `${page}.mdx`),
        `---\n${frontmatter}\n${social}\n---${source.slice(match[0].length)}`);
      count++;
    }
  }
  console.log(`Generated ${count} page-specific OG images.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
