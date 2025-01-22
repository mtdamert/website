using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;

namespace asp_website.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class LogOnInfoController : ControllerBase
    {
        // TODO: Move this to a database when I get one
        const string passwordFile = "passwords.txt";
        List<string?> usernames;
        List<string?> passwords;
        List<string?> salts;

        public LogOnInfoController()
        {
            usernames = new List<string?>();
            passwords = new List<string?>();
            salts = new List<string?>();

            //Test();

            try
            {
                using (StreamReader sr = new StreamReader(passwordFile))
                {
                    string? username = null, password = null, salt = null;
                    string? line = sr.ReadLine();
                    while (line != null)
                    {
                        // username
                        username = line;
                        line = sr.ReadLine();
                        usernames.Add(username);

                        if (line != null)
                        {
                            // password
                            password = line;
                            line = sr.ReadLine();
                            passwords.Add(password);

                            if (line != null)
                            {
                                // salt
                                salt = line;
                                line = sr.ReadLine();
                                salts.Add(salt);

                                if (line != null)
                                {
                                    // blank line
                                    line = sr.ReadLine();
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // TODO
            }
        }

        public void Test()
        {
            string username = "fake@username.com";

            byte[] password = Encoding.UTF8.GetBytes("cu*ious54leopArd");
            byte[] salt = RandomNumberGenerator.GetBytes(16);
            byte[] saltedHash = GenerateSaltedHash(password, salt);

            using (StreamWriter writer = new StreamWriter(passwordFile))
            {
                writer.WriteLine(username);
                writer.WriteLine(Convert.ToBase64String(saltedHash));
                writer.WriteLine(Convert.ToBase64String(salt));
                //writer.WriteLine();
            }
        }

        public static byte[] GenerateSaltedHash(byte[] plainText, byte[] salt)
        {
            byte[] plainTextWithSaltBytes =
              new byte[plainText.Length + salt.Length];

            for (int i = 0; i < plainText.Length; i++)
            {
                plainTextWithSaltBytes[i] = plainText[i];
            }
            for (int i = 0; i < salt.Length; i++)
            {
                plainTextWithSaltBytes[plainText.Length + i] = salt[i];
            }

            using (HashAlgorithm algorithm = SHA256.Create())
                return algorithm.ComputeHash(plainTextWithSaltBytes);
        }

        public static bool CompareByteArrays(byte[] array1, byte[] array2)
        {
            if (array1.Length != array2.Length)
            {
                return false;
            }

            for (int i = 0; i < array1.Length; i++)
            {
                if (array1[i] != array2[i])
                {
                    return false;
                }
            }

            return true;
        }

        public static string Base64Encode(string plainText)
        {
            byte[] plainTextBytes = Encoding.UTF8.GetBytes(plainText);
            return Convert.ToBase64String(plainTextBytes);
        }

        [HttpGet(Name = "GetLogOnInfo")]
        public string Get()
        {
            return "Logon test GET from ASP.NET successful";
        }


        [HttpPost(Name = "TryToLogIn")]
        public string Post([FromBody] LogonCredentials credentials)
        {
            if (credentials != null)
            {
                if (!string.IsNullOrEmpty(credentials.username) && !string.IsNullOrEmpty(credentials.password))
                {
                    // TODO: Verify credentials
                    int userIndex = usernames.IndexOf(credentials.username);
                    if (userIndex >= 0)
                    {
                        byte[] actualPassword = Convert.FromBase64String(passwords[userIndex]);

                        byte[] passwordBytes = Convert.FromBase64String(Base64Encode(credentials.password));
                        byte[] saltBytes = Convert.FromBase64String(salts[userIndex]);
                        byte[] inputPassword = GenerateSaltedHash(passwordBytes, saltBytes);

                        if (CompareByteArrays(actualPassword, inputPassword))
                        {
                            // Successful match
                            return "asdf1234";
                        }
                    }
                }
            }

            this.HttpContext.Response.StatusCode = 401;
            return "";
        }
    }
}
