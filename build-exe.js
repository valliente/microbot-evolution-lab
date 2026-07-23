import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const htmlPath = path.resolve('dist-standalone/index.html');
if (!fs.existsSync(htmlPath)) {
  console.error('dist-standalone/index.html does not exist. Run npm run build:single first.');
  process.exit(1);
}

const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Base64 encode the HTML content so special characters don't break C# string literals
const base64Html = Buffer.from(htmlContent).toString('base64');

const csharpCode = `
using System;
using System.IO;
using System.Text;
using System.Diagnostics;
using System.Windows.Forms;

namespace MicrobotEvolutionLab
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            try
            {
                string tempDir = Path.Combine(Path.GetTempPath(), "MicrobotEvolutionLab");
                Directory.CreateDirectory(tempDir);
                string htmlPath = Path.Combine(tempDir, "index.html");

                string base64Data = "${base64Html}";
                byte[] bytes = Convert.FromBase64String(base64Data);
                string htmlContent = Encoding.UTF8.GetString(bytes);

                File.WriteAllText(htmlPath, htmlContent, Encoding.UTF8);

                Process.Start(new ProcessStartInfo
                {
                    FileName = htmlPath,
                    UseShellExecute = true
                });
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error starting Microbot Evolution Lab: " + ex.Message, "Microbot Evolution Lab", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
`;

const csFilePath = path.resolve('Launcher.cs');
fs.writeFileSync(csFilePath, csharpCode, 'utf8');

console.log('Compiling MicrobotEvolutionLab.exe using csc.exe...');

const cscPath = 'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe';
const outExePath = path.resolve('MicrobotEvolutionLab.exe');

try {
  execSync(`"${cscPath}" /target:winexe /r:System.Windows.Forms.dll /out:"${outExePath}" "${csFilePath}"`, {
    stdio: 'inherit'
  });
  console.log('Successfully created standalone executable: MicrobotEvolutionLab.exe');
} catch (err) {
  console.error('Failed to compile executable:', err);
  process.exit(1);
} finally {
  if (fs.existsSync(csFilePath)) {
    fs.unlinkSync(csFilePath);
  }
}
