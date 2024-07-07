const LoadingUI = () => (
  <div 
    className="fixed flex w-screen h-screen justify-center items-center z-[99] overflow-hidden backdrop-blur-lg bg-white dark:bg-slate-900"
  >
    <img src="https://common-1323578300.cos.ap-shanghai.myqcloud.com/shulan-wxmp/logo_gbg.jpg" alt="logo" width={300} height={128} decoding="async" />
  </div>
);

export default LoadingUI;