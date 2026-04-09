export const getDeviceType = (): 'mobile' | 'desktop' => {
  const ua = navigator.userAgent;
  // Detecta se é celular/tablet ou computador
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};