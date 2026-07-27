import fs from 'fs';
import path from 'path';

const htmlPath = path.resolve('dist-standalone', 'index.html');
const htaPath = path.resolve('MicrobotEvolutionLab.hta');

if (!fs.existsSync(htmlPath)) {
  console.error('Error: dist-standalone/index.html not found! Run npm run build:single first.');
  process.exit(1);
}

let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const htaHeader = `<!DOCTYPE html>
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>Microbot Evolution Lab - Beta 0.1.1</title>
<HTA:APPLICATION
  ID="MicrobotEvolutionLabApp"
  APPLICATIONNAME="Microbot Evolution Lab"
  BORDER="thin"
  BORDERSTYLE="normal"
  CAPTION="yes"
  ICON="favicon.ico"
  MAXIMIZEBUTTON="yes"
  MINIMIZEBUTTON="yes"
  SHOWINTASKBAR="yes"
  SINGLEINSTANCE="yes"
  SYSMENU="yes"
  WINDOWSTATE="maximize"
  NAVIGABLE="yes"
/>
`;

htmlContent = htmlContent.replace(/<!doctype html>/i, htaHeader);
fs.writeFileSync(htaPath, htmlContent, 'utf8');
console.log('Successfully created Windows Defender-friendly HTML Application: MicrobotEvolutionLab.hta');
