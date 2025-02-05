using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;
using asp_website.Server.Models;

namespace asp_website.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class LogOnInfoController : ControllerBase
    {
        User user;

        public LogOnInfoController()
        {
            user = new User();
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
            if (credentials != null && credentials.username != null && credentials.password != null)
            {
                if (user.IsUserValid(credentials.username, credentials.password))
                {
                    return "asdf1234";
                }
            }

            this.HttpContext.Response.StatusCode = 401;
            return "";
        }
    }
}
