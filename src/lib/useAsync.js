export const delay = async () => {
  // 1s后输出'done'
  const res = await new Promise((resolve) => {
    setTimeout(() => {
      resolve("done");
    }, 1000);
  });
  return res;
};
