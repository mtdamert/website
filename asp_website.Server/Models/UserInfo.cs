
namespace asp_website.Server.Models
{
    [Serializable()]
    public class UserInfo
    {
        public static readonly string NotValid = "NotValid";
        public static readonly string Admin = "Admin";
        public static readonly string Client = "Client";

        public int? userId { get; set; }
        public string? username { get; set; }
        public string? emailAddress { get; set; }
        public byte[]? saltedHash { get; set; }
        public byte[]? salt { get; set; }
        public string? userRole { get; set; }
        public string? emailConfirmationGuid { get; set; }
        public bool emailConfirmed { get; set; }
    }
}
