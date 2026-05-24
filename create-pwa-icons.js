import fs from 'fs';

async function run() {
  try {
    let Jimp;
    try {
      const module = await import('jimp');
      Jimp = module.Jimp || module.default;
    } catch (e) {
      console.log("ESM loader fallback");
    }

    if (!Jimp) {
      throw new Error("Could not resolve Jimp class");
    }

    console.log("Reading sajilo_icon.jpg...");
    const baseImage = await Jimp.read('./public/sajilo_icon.jpg');
    
    console.log("Generating 512x512 physical PNG icon...");
    const icon512 = baseImage.clone().resize({ w: 512, h: 512 });
    await icon512.write('./public/sajilo_icon_512.png');
    await icon512.write('./public/sajilo_icon.png'); // keep generic fallback as well
    
    console.log("Generating 192x192 physical PNG icon...");
    const icon192 = baseImage.clone().resize({ w: 192, h: 192 });
    await icon192.write('./public/sajilo_icon_192.png');
    
    console.log("All PWA icons prepared successfully!");
  } catch (err) {
    console.error("Icon preparation failed:", err);
    process.exit(1);
  }
}

run();
