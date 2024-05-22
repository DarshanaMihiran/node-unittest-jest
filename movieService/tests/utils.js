const setupMock = (repo, method, returnValue) => {
    repo[method].mockResolvedValue(returnValue);
  };
  
const expectCalledWith = (repo, method, params) => {
  expect(repo[method]).toHaveBeenCalledWith(...params);
};

const expectResult = async (serviceMethod, params, expectedResult) => {
  const result = await serviceMethod(...params);
  expect(result).toEqual(expectedResult);
};

module.exports = {
  setupMock,
  expectCalledWith,
  expectResult,
};
  