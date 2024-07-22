const LoadingUI = () => (
  <div 
    className="fixed flex w-screen h-screen justify-center items-center z-[99] overflow-hidden bg-green-200/30 dark:bg-[#141414] animate-fade-in"
  >
    <img className="rounded-[12px] shadow-2xl shadow-green-500/50 dark:shadow-green-400/60 animate-zoom-out" src="https://common-1323578300.cos.ap-shanghai.myqcloud.com/shulan-wxmp/logo_gbg.jpg" alt="logo" width={300} height={128} decoding="async" />
  </div>
);

export default LoadingUI;