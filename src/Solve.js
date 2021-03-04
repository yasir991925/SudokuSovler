const solve = async (board, updateFn) => {
  let finished = false;
  const cancel = () => {
    finished = true;
    console.log("done");
  };
  const block = { 0: [0, 2], 1: [3, 5], 2: [6, 8] };

  const isSafe = (_i, _j, val) => {
    for (let k = 0; k < 9; k++) {
      let row = board[_i][k];
      let col = board[k][_j];
      if (row === val || col === val) {
        return false;
      }
    }
    const [i_start, i_end] = block[Math.floor(_i / 3)];
    const [j_start, j_end] = block[Math.floor(_j / 3)];

    for (let i = i_start; i <= i_end; i++) {
      for (let j = j_start; j <= j_end; j++) {
        if (board[i][j] === val) {
          return false;
        }
      }
    }
    return true;
  };

  const f = async (at) => {
    if (finished) {
      return false;
    }
    if (at === 81) {
      return true;
    }

    let i = Math.floor(at / 9);
    let j = at % 9;

    if (board[i][j] !== 0) {
      return await f(at + 1);
    }

    for (let x = 1; x <= 9; x++) {
      if (isSafe(i, j, x)) {
        await updateFn(i, j, x);
        if (await f(at + 1)) {
          return true;
        }
        await updateFn(i, j, 0);
      }
    }
    return false;
  };
  return f(0);
};

export default solve;
