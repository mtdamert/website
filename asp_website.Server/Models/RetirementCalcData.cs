
namespace asp_website.Server.Models
{
    [Serializable()]
    public class RetirementCalcData
    {
        public string? emailAddress {  get; set; }
        public int? age {  get; set; }
        public int? currentSavings { get; set; }
        public int? currentPostTaxSavings { get; set; }
        public int? currentRetirementSavings { get; set; }
        public int? currentIncome { get; set; }
        public int? livingExpenses { get; set; }
        public int? retirementAge { get; set; }
        public int? startSocialSecurityAge { get; set; }
        public int? estSocialSecurityIncome { get; set; }
        public int? predictedYieldPct { get; set; }
        public int? cpiPct { get; set; }
        public int? ageAtDeath {  get; set; }
        public bool? extrapolateCapitalGains { get; set; }
    }
}
