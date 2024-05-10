using Microsoft.AspNetCore.Mvc;
using System.Text.Json;


namespace asp_website.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DaysSinceEventsController : ControllerBase
    {
        DaysSinceEvent[]? daysSinceEvents;
        const string daysSinceEventsPath = "DaysSinceEvents.txt";

        public DaysSinceEventsController()
        {
            // Load days since events from file 
            string json = System.IO.File.ReadAllText(daysSinceEventsPath);
            if (!string.IsNullOrEmpty(json))
            {
                DaysSinceEvent[]? items = JsonSerializer.Deserialize<DaysSinceEvent[]>(json);
                if (items != null && items.Length > 0)
                    daysSinceEvents = items;
            }
        }

        [HttpGet(Name = "GetDaysSinceEvents")]
        public DaysSinceEvent[]? Get()
        {
            return daysSinceEvents;
        }

        [HttpPost(Name = "SetDaysSinceEvents")]
        public void Post([FromBody] DaysSinceEvent[] currentDaysSinceEvents)
        {
            // Save data to a file
            daysSinceEvents = currentDaysSinceEvents;

            string jsonString = JsonSerializer.Serialize(currentDaysSinceEvents);
            using (StreamWriter writer = new StreamWriter(daysSinceEventsPath))
            {
                writer.WriteLine(jsonString);
            }
        }
    }
}
