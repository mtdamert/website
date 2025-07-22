using asp_website.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Resend;
using System;
using System.Net;
using System.Net.Mail;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;

namespace asp_website.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ContactController : ControllerBase
    {
        private IConfiguration appSetting;

        public ContactController()
        {
            appSetting = new ConfigurationBuilder()
                    .SetBasePath(Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json")
                    .Build();
        }

        [HttpPost]
        public async Task<bool> Post([FromBody] EmailInfo emailInfo, [FromServices] IResend resend)
        {
            if (emailInfo == null || string.IsNullOrWhiteSpace(emailInfo.sender) || string.IsNullOrWhiteSpace(emailInfo.body))
                return false;

            // TODO: Sanitize email body
            EmailMessage message = new EmailMessage();
            message.From = "MTDamert.com Contact Form <mike@mtdamert.com>";
            message.To = "MTDamert Webmaster <mtdamert@gmail.com>";
            message.Subject = "Received Contact Form feedback from " + emailInfo.sender + " (" + emailInfo.email + ")";

            // Send confirmation email. Include GUID and userID
            string emailText = string.Empty;
            emailText += "Received an email from mtdamert.com user " + emailInfo.sender + ":<br /><br />\n\n";
            emailText += emailInfo.body;
            message.HtmlBody = emailText;

            ResendResponse<Guid> response = await resend.EmailSendAsync(message);

            return true;
        }

    }
}
