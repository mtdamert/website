import RetirementCalc from '../components/RetirementCalc';

function RetirementCalcPage(props) {
    return (
        <div className="page">
            <RetirementCalc emailAddress={props.emailAddress} />
        </div>
    )
}

export default RetirementCalcPage;
