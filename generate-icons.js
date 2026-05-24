import fs from 'fs';
import path from 'path';

async function run() {
  try {
    let Jimp;
    try {
      const module = await import('jimp');
      Jimp = module.Jimp || module.default;
    } catch (e) {
      console.log("ESM fallback loader...");
    }

    if (!Jimp) {
      throw new Error("Could not resolve Jimp class");
    }

    const publicPath = path.join(process.cwd(), "public");
    const distPath = path.join(process.cwd(), "dist");

    const sourceJpg = path.join(publicPath, "sajilo_icon.jpg");
    if (!fs.existsSync(sourceJpg)) {
      console.error(`Source image missing at ${sourceJpg}. Please make sure sajilo_icon.jpg exists in public/!`);
      process.exit(1);
    }

    console.log(`Reading source icon from: ${sourceJpg}`);
    const baseImage = await Jimp.read(sourceJpg);

    const targets = [
      { name: "sajilo_icon_192.png", size: 192 },
      { name: "sajilo_icon_512.png", size: 512 },
      { name: "sajilo_icon.png", size: 512 }
    ];

    // Ensure directories exist
    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath, { recursive: true });
    }
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath, { recursive: true });
    }

    for (const target of targets) {
      const pubFile = path.join(publicPath, target.name);
      const distFile = path.join(distPath, target.name);

      console.log(`Generating: ${target.name} (${target.size}x${target.size})`);
      const targetImage = baseImage.clone().resize({ w: target.size, h: target.size });
      await targetImage.write(pubFile);
      await targetImage.write(distFile);
    }

    console.log("All PWA icons generated successfully!");
  } catch (err) {
    console.error("Icon generation script failed:", err);
    process.exit(1);
  }
}

run();
