
namespace asp_website.Server.Models
{
    [Serializable()]
    public class UserInfo
    {
        public string Username { get; set; }
        public byte[] SaltedHash { get; set; }
        public byte[] Salt { get; set; }
    }
}
