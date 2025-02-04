using System.Security.Cryptography;
using System.Text;
using System.Xml.Serialization;

namespace asp_website.Server.Models
{
    public class User
    {
        const string passwordFile = "passwords.txt";
        //List<string?> usernames;
        //List<string?> saltedHashes;
        //List<string?> salts;

        const string passwordFileXml = "passwordsXml.txt";
        List<UserInfo> usersInfo;

        public User()
        {
            //usernames = new List<string?>();
            //saltedHashes = new List<string?>();
            //salts = new List<string?>();

            Test();

            // TODO: Remove this - we're switching to the XML code
            //try
            //{
            //    using (StreamReader sr = new StreamReader(passwordFile))
            //    {
            //        string? username = null, password = null, salt = null;
            //        string? line = sr.ReadLine();
            //        while (line != null)
            //        {
            //            // username
            //            username = line;
            //            line = sr.ReadLine();
            //            usernames.Add(username);

            //            if (line != null)
            //            {
            //                // password
            //                password = line;
            //                line = sr.ReadLine();
            //                saltedHashes.Add(password);

            //                if (line != null)
            //                {
            //                    // salt
            //                    salt = line;
            //                    line = sr.ReadLine();
            //                    salts.Add(salt);

            //                    if (line != null)
            //                    {
            //                        // blank line
            //                        line = sr.ReadLine();
            //                    }
            //                }
            //            }
            //        }
            //    }
            //}
            //catch (Exception ex)
            //{
            //    // TODO
            //}

            XmlSerializer serializer = new XmlSerializer(typeof(List<UserInfo>));
            using (StreamReader reader = new StreamReader(passwordFileXml))
            {
                usersInfo = (List<UserInfo>)serializer.Deserialize(reader);
            }
        }

        public void Test()
        {
            string username = "fake@username.com";
            string username2 = "fake2@username.com";

            byte[] password = Encoding.UTF8.GetBytes("cu*ious54leopArd");
            byte[] password2 = Encoding.UTF8.GetBytes("Password");
            byte[] salt = RandomNumberGenerator.GetBytes(16);
            byte[] salt2 = RandomNumberGenerator.GetBytes(16);
            byte[] saltedHash = GenerateSaltedHash(password, salt);
            byte[] saltedHash2 = GenerateSaltedHash(password2, salt2);

            //using (StreamWriter writer = new StreamWriter(passwordFile))
            //{
            //    writer.WriteLine(username);
            //    writer.WriteLine(Convert.ToBase64String(saltedHash));
            //    writer.WriteLine(Convert.ToBase64String(salt));
            //    //writer.WriteLine();
            //}

            using (StreamWriter writer = new StreamWriter(passwordFileXml))
            {
                UserInfo userInfo = new UserInfo();
                userInfo.Username = username;
                userInfo.SaltedHash = saltedHash;
                userInfo.Salt = salt;

                UserInfo userInfo2 = new UserInfo();
                userInfo2.Username = username2;
                userInfo2.SaltedHash = saltedHash2;
                userInfo2.Salt = salt2;

                List<UserInfo> userInfoList = new List<UserInfo> { userInfo, userInfo2 };

                XmlSerializer serializer = new XmlSerializer(typeof(List<UserInfo>));
                serializer.Serialize(writer, userInfoList);
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

        public int AddUser(string username, string password)
        {
            //if (!usernames.Contains(username))
            //{
            //    usernames.Add(username);

            //    byte[] passwordBytes = Encoding.UTF8.GetBytes(password);
            //    byte[] salt = RandomNumberGenerator.GetBytes(16);
            //    byte[] saltedHash = GenerateSaltedHash(passwordBytes, salt);

            //    saltedHashes.Add(Convert.ToBase64String(saltedHash));
            //    salts.Add(Convert.ToBase64String(salt));

            //    using (StreamWriter writer = new StreamWriter(passwordFile, true))
            //    {
            //        writer.WriteLine();
            //        writer.WriteLine(username);
            //        writer.WriteLine(Convert.ToBase64String(saltedHash));
            //        writer.WriteLine(Convert.ToBase64String(salt));

            //        // TODO: Save latest data to database
            //        using (StreamWriter xmlWriter = new StreamWriter(passwordFileXml))
            //        {
            //            List<UserInfo> userInfoList = new List<UserInfo>();
            //            for (int i=0; i<usernames.Count; i++)
            //            {
            //                UserInfo userInfo = new UserInfo();
            //                userInfo.Username = usernames[i];
            //                userInfo.SaltedHash = Encoding.UTF8.GetBytes(saltedHashes[i]);
            //                userInfo.Salt = Encoding.UTF8.GetBytes(salts[i]);

            //                userInfoList.Add(userInfo);
            //            }

            //            XmlSerializer serializer = new XmlSerializer(typeof(List<UserInfo>));
            //            serializer.Serialize(xmlWriter, userInfoList);
            //        }


            //        return usernames.Count - 1;
            //    }
            //}

            if (!usersInfo.Any(userInfo => userInfo.Username == username))
            {
                byte[] passwordBytes = Encoding.UTF8.GetBytes(password);
                byte[] salt = RandomNumberGenerator.GetBytes(16);
                byte[] saltedHash = GenerateSaltedHash(passwordBytes, salt);

                UserInfo newUserInfo = new UserInfo();
                newUserInfo.Username = username;
                newUserInfo.SaltedHash = saltedHash;
                newUserInfo.Salt = salt;

                usersInfo.Add(newUserInfo);

                // TODO: Save latest data to database
                using (StreamWriter xmlWriter = new StreamWriter(passwordFileXml))
                {
                    XmlSerializer serializer = new XmlSerializer(typeof(List<UserInfo>));
                    serializer.Serialize(xmlWriter, usersInfo);
                }

                return usersInfo.Count - 1;
            }

            return -1;
        }

        public bool DeleteUser(string userIndex)
        {
            // TODO

            return false;
        }

        public bool IsUserValid(string username, string password)
        {
            if (!string.IsNullOrWhiteSpace(username) && !string.IsNullOrWhiteSpace(password))
            {
                // Verify credentials
                //int userIndex = usernames.IndexOf(username);
                //if (userIndex >= 0)
                //{
                //    byte[] actualPassword = Convert.FromBase64String(saltedHashes[userIndex]);

                //    byte[] passwordBytes = Convert.FromBase64String(Base64Encode(password));
                //    byte[] saltBytes = Convert.FromBase64String(salts[userIndex]);
                //    byte[] inputPassword = GenerateSaltedHash(passwordBytes, saltBytes);

                //    if (User.CompareByteArrays(actualPassword, inputPassword))
                //    {
                //        // Successful match
                //        return true;
                //    }
                //}

                UserInfo? userInfo = usersInfo.FirstOrDefault(info => info.Username == username);
                if (userInfo != null)
                {
                    byte[] passwordBytes = Convert.FromBase64String(Base64Encode(password));
                    byte[] inputPassword = GenerateSaltedHash(passwordBytes, userInfo.Salt);

                    if (User.CompareByteArrays(userInfo.SaltedHash, inputPassword))
                    {
                        return true;
                    }
                }
            }

            return false;
        }

    }
}
