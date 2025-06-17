using asp_website.Server.Models;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Xml.Serialization;

namespace asp_website.Server.Controllers
{
    [ApiController]
    public class RetirementCalcDataController : ControllerBase
    {
        List<RetirementCalcData>? retirementCalcDataList;
        const string retirementCalcDataPath = "RetirementCalcData.txt";

        // TODO: Handle in database
        public RetirementCalcDataController()
        {
            if (System.IO.File.Exists(retirementCalcDataPath))
            {
                // Load all retirement calc data from file 
                XmlSerializer serializer = new XmlSerializer(typeof(List<RetirementCalcData>));
                using (StreamReader reader = new StreamReader(retirementCalcDataPath))
                {
                    var deserializedFile = serializer.Deserialize(reader);
                    if (deserializedFile != null)
                        retirementCalcDataList = (List<RetirementCalcData>)deserializedFile;
                    else
                        retirementCalcDataList = new List<RetirementCalcData>();
                }
            }
        }

        // TODO: Handle in database
        private void Save()
        {
            using (StreamWriter xmlWriter = new StreamWriter(retirementCalcDataPath))
            {
                XmlSerializer serializer = new XmlSerializer(typeof(List<RetirementCalcData>));
                serializer.Serialize(xmlWriter, retirementCalcDataList);
            }
        }

        [HttpPost]
        [Route("[controller]/loaddata")]
        public RetirementCalcData? LoadData([FromBody] string? emailAddress)
        {
            if (emailAddress != null && retirementCalcDataList != null)
            {
                RetirementCalcData? data = retirementCalcDataList.FirstOrDefault(data => data.emailAddress == emailAddress);
                return data;
            }

            return null;
        }

        [HttpPost]
        [Route("[controller]/savedata")]
        public void SaveData([FromBody] RetirementCalcData updatedData)
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
