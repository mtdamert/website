using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using asp_website.Server.Models;
using SendGrid;
using SendGrid.Helpers.Mail;
using System.Net.Mail;
using System.Net;
using System.Runtime.CompilerServices;

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
        public async Task<bool> Post([FromBody] EmailInfo emailInfo)
        {
            if (emailInfo == null || string.IsNullOrWhiteSpace(emailInfo.sender) || string.IsNullOrWhiteSpace(emailInfo.body))
                return false;

            // This needs to be set for the email to work
            string? apiKey = appSetting.GetValue<string>("SENDGRID_API_KEY", string.Empty);
            SendGridClient client = new SendGridClient(apiKey);
            EmailAddress from_email = new EmailAddress("mike@mtdamert.com", "Contact Mike Form");
            string subject = "Received Contact Form feedback from " + emailInfo.sender + " (" + emailInfo.email + ")";
            EmailAddress to_email = new EmailAddress("mtdamert@gmail.com", "MTDamert Webmaster");

            // TODO: Sanitize email body
            string emailText = string.Empty;
            emailText += "Received an email from mtdamert.com user " + emailInfo.sender + ":<br /><br />\n\n";
            emailText += emailInfo.body;

            string plainTextContent = emailText;
            string htmlContent = emailText;
            SendGridMessage msg = MailHelper.CreateSingleEmail(from_email, to_email, subject, plainTextContent, htmlContent);
            Response response = await client.SendEmailAsync(msg).ConfigureAwait(false);

            return true;
        }

    }
}
