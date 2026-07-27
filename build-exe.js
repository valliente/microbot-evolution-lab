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
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Windows.Forms;
using Microsoft.Win32;

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

                // Set IE Browser Emulation Registry Key for Fallback
                try
                {
                    string exeName = Path.GetFileName(Process.GetCurrentProcess().MainModule.FileName);
                    using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\\Microsoft\\Internet Explorer\\Main\\FeatureControl\\FEATURE_BROWSER_EMULATION"))
                    {
                        if (key != null) key.SetValue(exeName, 11001, RegistryValueKind.DWord);
                    }
                }
                catch {}

                // Extract HTML to LocalAppData Workspace
                string appDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "MicrobotEvolutionLab");
                if (!Directory.Exists(appDir)) Directory.CreateDirectory(appDir);

                string tempHtml = Path.Combine(appDir, "index.html");
                byte[] bytes = Convert.FromBase64String("${htmlBase64}");
                File.WriteAllBytes(tempHtml, bytes);

                string fileUri = "file:///" + tempHtml.Replace("\\\\", "/");

                // Attempt to launch using Edge App Mode (Chromium Native Desktop Window)
                string edgePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\\Edge\\Application\\msedge.exe");
                if (!File.Exists(edgePath))
                {
                    edgePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\\Edge\\Application\\msedge.exe");
                }

                bool launched = false;
                if (File.Exists(edgePath))
                {
                    try
                    {
                        ProcessStartInfo psi = new ProcessStartInfo
                        {
                            FileName = edgePath,
                            Arguments = "--app=\\"" + fileUri + "\\" --window-size=1280,850",
                            UseShellExecute = true
                        };
                        Process.Start(psi);
                        launched = true;
                    }
                    catch {}
                }

                // Fallback to Default Web Browser
                if (!launched)
                {
                    try
                    {
                        Process.Start(new ProcessStartInfo { FileName = fileUri, UseShellExecute = true });
                        launched = true;
                    }
                    catch {}
                }

                // WinForms Fallback Window if process launch fails
                if (!launched)
                {
                    Form form = new Form
                    {
                        Text = "Microbot Evolution Lab - 0.1.202",
                        Width = 1280,
                        Height = 850,
                        StartPosition = FormStartPosition.CenterScreen,
                        WindowState = FormWindowState.Maximized
                    };

                    WebBrowser browser = new WebBrowser
                    {
                        Dock = DockStyle.Fill,
                        ScriptErrorsSuppressed = false
                    };

                    form.Controls.Add(browser);
                    browser.Navigate(tempHtml);
                    Application.Run(form);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Microbot Evolution Lab Launcher Error:\\n\\n" + ex.ToString(), "Launch Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
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
  console.log('Successfully created robust standalone executable: MicrobotEvolutionLab.exe');
} catch (err) {
  console.error('Failed to compile C# executable:', err);
} finally {
  if (fs.existsSync(csPath)) {
    fs.unlinkSync(csPath);
  }
}
