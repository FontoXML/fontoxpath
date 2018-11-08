export const mergeUpdates = function (pul1, ...puls) {
	return pul1.concat(puls.filter(Boolean));
};
