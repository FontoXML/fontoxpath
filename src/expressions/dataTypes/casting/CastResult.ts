import AtomicValue from '../AtomicValue';

type ErrorResult = {
	successful: false;
	error: Error
};
type SuccessResult = {
	successful: true;
	value: AtomicValue<any>
};

type CastResult = ErrorResult | SuccessResult;

export default CastResult;
