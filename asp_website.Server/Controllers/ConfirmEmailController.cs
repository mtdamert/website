using asp_website.Server.Models;
using Microsoft.AspNetCore.Mvc;
using System.Xml.Serialization;

namespace asp_website.Server.Controllers
{
    namespace asp_website.Server.Controllers
    {
        public class EmailConfirmationInfo
        {
            public int? userId { get; set; }
            public string? emailConfirmationGuid { get; set; }
        }

        [ApiController]
        [Route("[controller]")]
        public class ConfirmEmailController : ControllerBase
        {
            const string passwordFileXml = "passwordsXml.txt";
            List<UserInfo> usersInfo;

            public ConfirmEmailController()
            {
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

            [HttpPost]
            public string ConfirmEmailAddress([FromBody] EmailConfirmationInfo confirmationInfo)
            {
                if (confirmationInfo.userId <= usersInfo.Count
                    && confirmationInfo.userId.HasValue
                    && usersInfo[confirmationInfo.userId.Value - 1] != null
                    && !string.IsNullOrEmpty(usersInfo[confirmationInfo.userId.Value - 1].emailConfirmationGuid)
                    && usersInfo[confirmationInfo.userId.Value - 1].emailConfirmationGuid == confirmationInfo.emailConfirmationGuid)
                {
                    usersInfo[confirmationInfo.userId.Value - 1].emailConfirmed = true;

                    // TODO: Save usersInfo
                    // TODO: Redirect
                    return "Account confirmed";
                }

                return "No such account found";
            }
        }
    }
}
