import { useState, useEffect } from 'react';
import { BarChart, Bar, Rectangle, XAxis, Tooltip } from 'recharts';

async function saveData(retirementData) {
    console.log("Attempting to send request to server");

    const fetchToken = await fetch('retirementcalcdata', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(retirementData)
    });

    console.log("Finished attempting to send request to server");
}

function RetirementCalc({ emailAddress }) {
    // TODO: If emailAddress exists, we are logged in and can save data
    const [currentSavings, setCurrentSavings] = useState(0);
    const [currentPostTaxSavings, setCurrentPostTaxSavings] = useState(0);
    const [currentRetirementSavings, setCurrentRetirementSavings] = useState(0);

    const [currentIncome, setCurrentIncome] = useState(0);
    const [livingExpenses, setLivingExpenses] = useState(0);
    const [currentAge, setCurrentAge] = useState(40);
    const [retirementAge, setRetirementAge] = useState(65);
    const [startSocialSecurityAge, setStartSocialSecurityAge] = useState(70);
    const [estSocialSecurityIncome, setEstSocialSecurityIncome] = useState(0);
    const [predictedYieldPct, setPredictedYieldPct] = useState(8);
    const [cpiPct, setCpiPct] = useState(3);
    const [ageAtDeath, setAgeAtDeath] = useState(90);
    const [extrapolateCapGains, setExtrapolateCapGains] = useState(false);
    const [zeroSavingsAge, setZeroSavingsAge] = useState(40);
    const [data, setData] = useState([]);

    const [zeroSavingsAgeColor, setZeroSavingsAgeColor] = useState('text-black');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const saveDataResult = await saveData({
            emailAddress,
            currentAge,
            currentSavings,
            currentPostTaxSavings,
            currentRetirementSavings,
            currentIncome,
            livingExpenses,
            retirementAge,
            startSocialSecurityAge,
            estSocialSecurityIncome,
            predictedYieldPct,
            cpiPct,
            ageAtDeath,
            extrapolateCapGains
        });
    }

    useEffect(() => { getSavingsZeroAge(); }, [currentAge]);
    useEffect(() => { getSavingsZeroAge(); }, [currentSavings]);
    useEffect(() => { getSavingsZeroAge(); }, [currentPostTaxSavings]);
    useEffect(() => { getSavingsZeroAge(); }, [currentRetirementSavings]);
    useEffect(() => { getSavingsZeroAge(); }, [currentIncome]);
    useEffect(() => { getSavingsZeroAge(); }, [livingExpenses]);
    useEffect(() => { getSavingsZeroAge(); }, [retirementAge]);
    useEffect(() => { getSavingsZeroAge(); }, [startSocialSecurityAge]);
    useEffect(() => { getSavingsZeroAge(); }, [estSocialSecurityIncome]);
    useEffect(() => { getSavingsZeroAge(); }, [predictedYieldPct]);
    useEffect(() => { getSavingsZeroAge(); }, [cpiPct]);
    useEffect(() => { getSavingsZeroAge(); }, [ageAtDeath]);
    useEffect(() => { getSavingsZeroAge(); }, [extrapolateCapGains]);

    let calcIsRunning = false;

    async function getSavingsZeroAge() {
        let ageCounter = currentAge;
        let remainingSavings = (currentPostTaxSavings !== 0) ? currentPostTaxSavings : currentSavings;
        let remainingPreTaxSavings = currentRetirementSavings;
        let yearlyExpenses = livingExpenses;
        let sSIncome = estSocialSecurityIncome;
        let ageOfDeath = ageAtDeath;
        let currentYear = new Date().getFullYear();

        let capGainsLow = 44625; // below this point, no cap gains
        let capGainsHigh = 492300; // below this point, 15%; above this point, 20% 

        let earlyWithdrawalPenalty = 0;

        calcIsRunning = true;

        setData([]);

        // TODO: Cap gains tax - this can also be married (joint filing), married (separate filing), or head of household
        // TODO: Add cost basis
        // TODO: Break savings into basic and retirement (and add fee for withdrawal before age 59.5)

        // Cap simulation at age 200
        if (ageOfDeath < currentAge)
            ageOfDeath = 200;

        // Main simulation loop
        while ((remainingSavings > 0 || remainingPreTaxSavings > 0) && ageCounter < ageOfDeath) {
            remainingSavings -= yearlyExpenses;

            // If this calculation gets re-started while running this version, stop this calc and only run the new calc
            if (!calcIsRunning) {
                return;
            }
            
            // If post-tax savings run out, we have to take money from retirement accounts at a 10% penalty
            if (remainingSavings < 0 && remainingPreTaxSavings > 0) {
                remainingPreTaxSavings -= -(remainingSavings / 9 * 10);
                earlyWithdrawalPenalty += (-remainingSavings / 9);
            }

            yearlyExpenses *= (1.0 + (cpiPct * 0.01));
            sSIncome *= 1.02;
            remainingSavings *= (1.0 + (predictedYieldPct * 0.01));
            remainingPreTaxSavings *= (1.0 + (predictedYieldPct * 0.01));
            if (ageCounter < retirementAge)
                remainingSavings += Number(currentIncome);
            if (ageCounter >= startSocialSecurityAge)
                remainingSavings += sSIncome;

            if (extrapolateCapGains === true) {
                capGainsLow *= yearlyExpenses;
                capGainsHigh *= yearlyExpenses;
            }

            // console.log("age: " + ageCounter);
            // console.log("savings: " + remainingSavings);
            // console.log("expenses: " + yearlyExpenses);

            ageCounter += 1;

            // At age 59.5, move retirement savings to regular savings bucket, because it's no longer taxed
            if (ageCounter >= 60) {
                remainingSavings += remainingPreTaxSavings;
                remainingPreTaxSavings = 0;
            }

            setData(data => [
                ...data,
                { name: "" + currentYear, uv: 2000, pv: remainingSavings }
            ]);
            console.log("running sim for year " + currentYear + ", remaining savings: " + remainingSavings + ", data length: " + data.length);

            await new Promise(r => setTimeout(r, 10)); // wait for X ms before continuing processing

            currentYear += 1;
        }

        if (ageCounter == ageOfDeath && remainingSavings > 0) {
            // ERROR: We can't set this, because it re-runs this loop             //setDeathAge(100); // TEST TEST TEST
            // console.log("STILL SOME MONEY LEFT AT DEATH");
            // console.log("ageCounter: " + ageCounter);
            // console.log("ageOfDeath: " + ageOfDeath);
            // console.log("remainingSavings: " + remainingSavings);
            // console.log("============");
            setZeroSavingsAgeColor('font-bold text-green-800');
        } else {
            setZeroSavingsAgeColor('font-bold text-red-800');
        }

        console.log("Total earlyWithdrawalPenalty: " + earlyWithdrawalPenalty);
        console.log("==========================================");

        if (ageCounter === currentAge)
            setZeroSavingsAge(currentAge);
        else
            setZeroSavingsAge(ageCounter);
    }

    // If you can spend more than you're spending, calculate that difference
    // This would only affect Living Expenses - try increasing them by... 10%?
    // const getExtraSpending() {

    // }

    return (
        <div class="content">
            <div>
                <div class="title">Retirement Calculator</div>
                <div className="pl-8">
                    <label className="italic">
                        For use with US taxes
                    </label>
                </div>
            </div>
            <div class="form-background">
                <form onSubmit={handleSubmit} className="inline-block">
                    <div className="pt-4">
                        <label className="font-semibold">
                            Current Age: 
                            </label>
                            <input type="number"
                                value={currentAge}
                                onChange={(e) => { setCurrentAge(Number(e.target.value)); } }
                                className="float-right border text-right w-12"
                            />
                    </div>

                    <div className="pt-4">
                        <label className="font-semibold">
                            Current Savings:
                        </label>{/* todo: sanitize input */}
                        <input type="text"
                            value={currentSavings}
                            onChange={(e) => { setCurrentSavings(e.target.value); setCurrentPostTaxSavings(0); setCurrentRetirementSavings(0); } } 
                            className="float-right border text-right w-30"
                        />
                    </div>

                    <div className="border ml-2 border-gray-500 p-4">

                        <div>
                            <label className="font-semibold">
                                Current Post-Tax Savings:
                            </label>{/* todo: sanitize input */}
                            <input type="text"
                                value={[currentPostTaxSavings]}
                                onChange={
                                    (e) => { setCurrentPostTaxSavings(e.target.value); setSavings(Number(e.target.value) + Number(currentRetirementSavings)); }
                                } 
                                className="float-right border text-right w-30"
                            />
                        </div>

                        <div className="pt-4">
                            <label className="font-semibold">
                                Current Retirement Savings:
                            </label>{/* todo: sanitize input */}
                            <input type="text"
                                value={currentRetirementSavings}
                                onChange={
                                    (e) => { setCurrentRetirementSavings(e.target.value); setSavings(Number(e.target.value) + Number(currentPostTaxSavings)); }
                                } 
                                className="float-right border text-right w-30"
                            />
                        </div>

                    </div>

                    <div className="pt-4">
                        <label className="font-semibold">
                            Current Income:
                        </label>
                        <input type="text"
                            value={currentIncome}
                            onChange={(e) => { setCurrentIncome(e.target.value); } }
                            className="float-right border text-right w-30"
                        />
                    </div>

                    <div className="pt-4">
                        <label className="font-semibold">
                            Living Expenses:
                        </label>{/* todo: sanitize input */}
                        <input type="text"
                            value={livingExpenses}
                                onChange={(e) => { console.log("living expenses - e.target.value: " + e.target.value); setLivingExpenses(e.target.value); }}
                            className="float-right border text-right w-24"
                        />
                    </div>

                    <div className="pt-4">
                        <label className="font-semibold">
                            Retirement Age:
                        </label>
                        <input type="number"
                            value={retirementAge}
                            onChange={(e) => { setRetirementAge(e.target.value); if (startSocialSecurityAge === 0) setStartSocialSecurityAge(e.target.value); }}
                            className="float-right border text-right w-12"
                        />
                    </div>{/* todo: Use this value, and also add a 'yearly income' value */}

                    <div className="pt-4">
                        <label className="font-semibold">
                            Age to Start Social Security:
                        </label>
                        <input type="number"
                            value={startSocialSecurityAge}
                            onChange={(e) => { setStartSocialSecurityAge(e.target.value); } }
                            className="float-right border text-right w-12"
                        />
                    </div>{/* TODO: Create a tooltip that leads to: https://www.ssa.gov/OACT/quickcalc/ */}

                    <div className="pt-4">
                        <label className="font-semibold">
                            Estimated Social Security Income (in today's dollars)
                        </label>
                        <input type="text"
                            value={estSocialSecurityIncome}
                            onChange={(e) => { setEstSocialSecurityIncome(e.target.value); } }
                            className="float-right border text-right w-24"
                        />
                    </div>


                    <div className="pt-4">
                        <label className="font-semibold">
                            Predicted Yield:
                        </label>
                        <span className="float-right">%</span>
                        <input type="number"
                            value={predictedYieldPct}
                            onChange={(e) => { setPredictedYieldPct(e.target.value); } }
                            className="float-right border text-right w-12"
                        />
                    </div>

                    <div className="pt-4">
                        <label className="font-semibold">
                            CPI:
                        </label>
                        <span className="float-right">%</span>
                        <input type="number"
                            value={cpiPct}
                            onChange={(e) => { setCpiPct(e.target.value); } }
                            className="float-right border text-right w-12"
                        />
                    </div>


                    <div className="pt-4">
                        <label className="font-semibold">
                            Age at Death:
                        </label>
                        <input type="number"
                            value={ageAtDeath}
                            onChange={(e) => { setAgeAtDeath(e.target.value); } }
                            className="float-right border text-right w-12"
                        />
                    </div>

                    <div className="pt-8">
                        <label className="font-semibold">
                            Use CPI to Extrapolate Capital Gains based on 2025 Rate
                        </label>
                        <input type="checkbox"
                            value={extrapolateCapGains}
                            onChange={(e) => { setExtrapolateCapGains(e.target.value); } }
                            className="float-right border text-right"
                        />
                    </div>

                    <div className="pt-6"><span className={zeroSavingsAgeColor}>At the current rate, your savings will run out when you reach age {zeroSavingsAge}</span></div>
                    <div className="pt-6"><span className="font-semibold"></span></div>

                    {
                        (emailAddress != null && emailAddress != "")
                            ? <div><button type="submit">Save Data for Next Use</button></div>
                            : <div></div>
                    }

                </form>

                <div className="inline-block">
                    <BarChart id="barGraph" width={400} height={300} data={data}>
                        <Bar dataKey="pv" fill="#c58847" activeBar={<Rectangle stroke="red" />} />
                        <XAxis dataKey="name" />
                        <Tooltip />
                    </BarChart>
                </div>

            </div>
        </div>
    );
}

export default RetirementCalc;
