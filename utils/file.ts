export const convertDataURIToFile = (dataURI: string) => {
  const arr = dataURI.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  if(!mime) throw new Error('Invalid dataURI.');

  const bstr = window.atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while(n--) u8arr[n] = bstr.charCodeAt(n);

  return new File([u8arr], 'tempImage.png', { type: mime });
};