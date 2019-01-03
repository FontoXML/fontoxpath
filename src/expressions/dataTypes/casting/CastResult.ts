import AtomicValue from '../AtomicValue';

type ErrorResult = {
	successful: false;
	error: Error
};
type SuccessResult = {
	successful: true;
	value: AtomicValue
};

type CastResult = ErrorResult | SuccessResult;

export default CastResult;
