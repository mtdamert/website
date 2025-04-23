using asp_website.Server.Models;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace asp_website.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class RetirementCalcController : ControllerBase
    {
        List<RetirementCalcData>? allRetirementCalcData;
        const string retirementCalcDataPath = "RetirementCalcData.txt";

        // TODO: Handle in database
        public RetirementCalcController()
        {
            if (System.IO.File.Exists(retirementCalcDataPath))
            {
                // Load all retirement calc data from file 
                string json = System.IO.File.ReadAllText(retirementCalcDataPath);
                if (!string.IsNullOrEmpty(json))
                {
                    List<RetirementCalcData>? items = JsonSerializer.Deserialize<List<RetirementCalcData>>(json);
                    if (items != null && items.Count > 0)
                        allRetirementCalcData = items;
                }
            }

        }

        private void Save()
        {
            // TODO: Write this
        }

        [HttpGet]
        public RetirementCalcData? Get(string emailAddress)
        {
            if (emailAddress != null && allRetirementCalcData != null)
            {
                RetirementCalcData? data = allRetirementCalcData.FirstOrDefault(data => data.emailAddress == emailAddress);
                return data;
            }

            return null;
        }

        [HttpPost]
        public void Post([FromBody] RetirementCalcData updatedData)
        {
            if (allRetirementCalcData == null)
            {
                allRetirementCalcData = new List<RetirementCalcData>();
            }

            RetirementCalcData? data = allRetirementCalcData.FirstOrDefault(data => data.emailAddress == updatedData.emailAddress);
            if (data != null)
            {
                // Update this data. TODO: Test this line
                data = updatedData;
            }
            else
            {
                allRetirementCalcData.Add(updatedData);
            }

            Save();
        }

    }
}
