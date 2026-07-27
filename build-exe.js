import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const htmlPath = path.resolve('dist-standalone', 'index.html');
const exePath = path.resolve('MicrobotEvolutionLab.exe');

if (!fs.existsSync(htmlPath)) {
  console.error('Error: dist-standalone/index.html not found! Run npm run build:single first.');
  process.exit(1);
}

const htmlBase64 = fs.readFileSync(htmlPath).toString('base64');

const csharpCode = `
using System;
using System.IO;
using System.Text;
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
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);

                string tempHtml = Path.Combine(Path.GetTempPath(), "microbot_lab_" + Guid.NewGuid().ToString("N") + ".html");
                byte[] bytes = Convert.FromBase64String("${htmlBase64}");
                File.WriteAllBytes(tempHtml, bytes);

                Form form = new Form
                {
                    Text = "Microbot Evolution Lab - Beta 0.1.2",
                    Width = 1280,
                    Height = 850,
                    StartPosition = FormStartPosition.CenterScreen,
                    WindowState = FormWindowState.Maximized
                };

                WebBrowser browser = new WebBrowser
                {
                    Dock = DockStyle.Fill,
                    ScriptErrorsSuppressed = true
                };

                form.Controls.Add(browser);
                form.FormClosed += (s, e) => {
                    try { if (File.Exists(tempHtml)) File.Delete(tempHtml); } catch {}
                };

                browser.Navigate(tempHtml);
                Application.Run(form);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Failed to launch Microbot Evolution Lab: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
`;

const csPath = path.resolve('temp_runner.cs');
fs.writeFileSync(csPath, csharpCode, 'utf8');

const cscCompiler = 'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe';

try {
  console.log('Compiling MicrobotEvolutionLab.exe using csc.exe...');
  const cmd = '"' + cscCompiler + '" /target:winexe /out:"' + exePath + '" /r:System.dll,System.Windows.Forms.dll,System.Drawing.dll "' + csPath + '"';
  execSync(cmd, { stdio: 'inherit' });
  console.log('Successfully created standalone executable: MicrobotEvolutionLab.exe');
} catch (err) {
  console.error('Failed to compile C# executable:', err);
} finally {
  if (fs.existsSync(csPath)) {
    fs.unlinkSync(csPath);
  }
}
