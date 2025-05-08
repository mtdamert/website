using asp_website.Server.Models;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Xml.Serialization;

namespace asp_website.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class RetirementCalcController : ControllerBase
    {
        List<RetirementCalcData>? retirementCalcDataList;
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
                        retirementCalcDataList = items;
                }
            }

        }

        private void Save()
        {
            // TODO: Write this
            using (StreamWriter xmlWriter = new StreamWriter(retirementCalcDataPath))
            {
                XmlSerializer serializer = new XmlSerializer(typeof(List<UserInfo>));
                serializer.Serialize(xmlWriter, retirementCalcDataList);
            }
        }

        [HttpGet]
        public RetirementCalcData? Get(string emailAddress)
        {
            if (emailAddress != null && retirementCalcDataList != null)
            {
                RetirementCalcData? data = retirementCalcDataList.FirstOrDefault(data => data.emailAddress == emailAddress);
                return data;
            }

            return null;
        }

        [HttpPost]
        public void Post([FromBody] RetirementCalcData updatedData)
        {
            if (retirementCalcDataList == null)
            {
                retirementCalcDataList = new List<RetirementCalcData>();
            }

            RetirementCalcData? data = retirementCalcDataList.FirstOrDefault(data => data.emailAddress == updatedData.emailAddress);
            if (data != null)
            {
                // Update this data. TODO: Test this line
                data = updatedData;
            }
            else
            {
                retirementCalcDataList.Add(updatedData);
            }

            Save();
        }

    }
}
