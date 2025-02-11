
namespace asp_website.Server.Models
{
    [Serializable()]
    public class UserInfo
    {
        public static readonly int Admin = 1;
        public static readonly int Client = 2;

        public string Username { get; set; }
        public byte[] SaltedHash { get; set; }
        public byte[] Salt { get; set; }
        public int UserRole { get; set; }
    }
}
