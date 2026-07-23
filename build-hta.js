import fs from 'fs';
import path from 'path';

const htmlPath = path.resolve('dist-standalone/index.html');
if (!fs.existsSync(htmlPath)) {
  console.error('dist-standalone/index.html does not exist. Run npm run build:single first.');
  process.exit(1);
}

let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const htaHeader = `<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<HTA:APPLICATION
    ID="MicrobotEvolutionLabApp"
    APPLICATIONNAME="Microbot Evolution Lab"
    BORDER="thin"
    BORDERSTYLE="normal"
    CAPTION="yes"
    MAXIMIZEBUTTON="yes"
    MINIMIZEBUTTON="yes"
    SHOWINTASKBAR="yes"
    SINGLEINSTANCE="no"
    SYSMENU="yes"
    WINDOWSTATE="maximize"
    SCROLL="no">`;

htmlContent = htmlContent.replace('<head>', htaHeader);

const htaPath = path.resolve('MicrobotEvolutionLab.hta');
fs.writeFileSync(htaPath, htmlContent, 'utf8');
console.log('Successfully created Windows Defender-friendly HTML Application: MicrobotEvolutionLab.hta');
