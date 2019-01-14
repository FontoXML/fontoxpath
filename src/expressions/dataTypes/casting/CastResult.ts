import AtomicValue from '../AtomicValue';

type ErrorResult = {
	error: Error;
	successful: false;
};
type SuccessResult = {
	successful: true;
	value: AtomicValue;
};

type CastResult = ErrorResult | SuccessResult;

export default CastResult;
