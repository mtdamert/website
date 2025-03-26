using System.Security.Cryptography;
using System.Text;
using System.Xml.Serialization;

namespace asp_website.Server.Models
{
    public class WebsiteUser
    {
        const string passwordFileXml = "passwordsXml.txt";
        List<UserInfo> usersInfo;

        public WebsiteUser()
        {
            //Test();

            // Load all UserInfo objects from a file
            XmlSerializer serializer = new XmlSerializer(typeof(List<UserInfo>));
            using (StreamReader reader = new StreamReader(passwordFileXml))
            {
                var deserializedFile = serializer.Deserialize(reader);
                if (deserializedFile != null)
                    usersInfo = (List<UserInfo>)deserializedFile;
                else
                    usersInfo = new List<UserInfo>();
            }
        }

        public void Test()
        {
            string username = "Test User Admin";
            string username2 = "Test User NonAdmin";
            string emailAddress = "fake@username.com";
            string emailAddress2 = "fake2@username.com";

            byte[] password = Encoding.UTF8.GetBytes("cu*ious54leopArd");
            byte[] password2 = Encoding.UTF8.GetBytes("Password");
            byte[] salt = RandomNumberGenerator.GetBytes(16);
            byte[] salt2 = RandomNumberGenerator.GetBytes(16);
            byte[] saltedHash = GenerateSaltedHash(password, salt);
            byte[] saltedHash2 = GenerateSaltedHash(password2, salt2);

            using (StreamWriter writer = new StreamWriter(passwordFileXml))
            {
                UserInfo userInfo = new UserInfo();
                userInfo.userId = 1;
                userInfo.username = username;
                userInfo.emailAddress = emailAddress;
                userInfo.saltedHash = saltedHash;
                userInfo.salt = salt;
                userInfo.userRole = UserInfo.Admin;
                userInfo.emailConfirmationGuid = string.Empty;
                userInfo.emailConfirmed = true;

                UserInfo userInfo2 = new UserInfo();
                userInfo2.userId = 2;
                userInfo2.username = username2;
                userInfo2.emailAddress = emailAddress2;
                userInfo2.saltedHash = saltedHash2;
                userInfo2.salt = salt2;
                userInfo2.userRole = UserInfo.Client;
                userInfo2.emailConfirmationGuid = string.Empty;
                userInfo2.emailConfirmed = true;

                List<UserInfo> userInfoList = new List<UserInfo> { userInfo, userInfo2 };

                XmlSerializer serializer = new XmlSerializer(typeof(List<UserInfo>));
                serializer.Serialize(writer, userInfoList);
            }
        }

        public static void SaveAllUserInfo(List<UserInfo> userInfoList)
        {
            // Currently saves all user info because the entire file needs to be rewritten
            // DEBUG: Is passwordFileXml set when this is called statically?
            using (StreamWriter xmlWriter = new StreamWriter(passwordFileXml))
            {
                XmlSerializer serializer = new XmlSerializer(typeof(List<UserInfo>));
                serializer.Serialize(xmlWriter, userInfoList);
            }
        }

        // TODO: When this is saved to the database, only save the updated user info
        private void SaveUserInfo(UserInfo userInfo)
        {
            // Currently saves all user info because the entire file needs to be rewritten
            using (StreamWriter xmlWriter = new StreamWriter(passwordFileXml))
            {
                XmlSerializer serializer = new XmlSerializer(typeof(List<UserInfo>));
                serializer.Serialize(xmlWriter, usersInfo);
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

        public UserInfo? AddUser(string username, string emailAddress, string password)
        {
            if (!usersInfo.Any(userInfo => userInfo.username == username))
            {
                byte[] passwordBytes = Encoding.UTF8.GetBytes(password);
                byte[] salt = RandomNumberGenerator.GetBytes(16);
                byte[] saltedHash = GenerateSaltedHash(passwordBytes, salt);

                UserInfo newUserInfo = new UserInfo();
                newUserInfo.userId = usersInfo.Count + 1;
                newUserInfo.username = username;
                newUserInfo.emailAddress = emailAddress;
                newUserInfo.saltedHash = saltedHash;
                newUserInfo.salt = salt;
                newUserInfo.userRole = UserInfo.Client;
                newUserInfo.emailConfirmationGuid = Guid.NewGuid().ToString();
                newUserInfo.emailConfirmed = false;

                usersInfo.Add(newUserInfo);

                // Save latest data to database
                SaveUserInfo(newUserInfo);

                return newUserInfo;
            }

            return null;
        }

        public bool ConfirmUserEmail(string guid)
        {
            UserInfo? userInfo = usersInfo.FirstOrDefault(userInfo => userInfo.emailConfirmationGuid == guid);
            if (userInfo != null)
            {
                userInfo.emailConfirmed = true;
                SaveUserInfo(userInfo);

                return true;
            }

            return false;
        }

        public bool DeleteUser(string userIndex)
        {
            // TODO

            return false;
        }

        public UserInfo? GetUserInfo(string emailAddress)
        {
            return usersInfo.FirstOrDefault(info => info.emailAddress == emailAddress);
        }

        public bool IsUserValid(string emailAddress, string password)
        {
            if (!string.IsNullOrWhiteSpace(emailAddress) && !string.IsNullOrWhiteSpace(password))
            {
                UserInfo? userInfo = usersInfo.FirstOrDefault(info => info.emailAddress == emailAddress);
                if (userInfo != null && userInfo.salt != null && userInfo.saltedHash != null)
                {
                    byte[] passwordBytes = Convert.FromBase64String(Base64Encode(password));
                    byte[] inputPassword = GenerateSaltedHash(passwordBytes, userInfo.salt);

                    if (WebsiteUser.CompareByteArrays(userInfo.saltedHash, inputPassword))
                    {
                        return true;
                    }
                }
            }

            return false;
        }

    }
}
