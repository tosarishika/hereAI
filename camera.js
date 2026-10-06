'use strict';
let scannerControls=null, cameraGeneration=0, qrPerson=null;
function stopCamera(message='Camera off. Click Start camera to scan another QR code.'){
 cameraGeneration++;
 scannerControls?.stop();scannerControls=null;
 const video=$('camera-video');video.srcObject?.getTracks().forEach(track=>track.stop());video.srcObject=null;video.hidden=true;
 $('start-camera').disabled=false;$('stop-camera').hidden=true;$('camera-status').textContent=message;
}
async function startCamera(){
 if(!navigator.mediaDevices?.getUserMedia){$('camera-status').textContent='Camera access requires HTTPS or localhost and a supported browser. Use the deployed Vercel link.';return;}
 if(!window.ZXingBrowser){$('camera-status').textContent='QR scanner could not load. Check your internet connection and reload. You can still enter an ID.';return;}
 const generation=++cameraGeneration;
 $('start-camera').disabled=true;$('stop-camera').hidden=false;$('camera-status').textContent='Allow camera access in your browser to start scanning…';$('camera-video').hidden=false;
 try{
  const reader=new ZXingBrowser.BrowserQRCodeReader();
  const controls=await reader.decodeFromConstraints({video:{facingMode:'environment'},audio:false},$('camera-video'),(result,error,controls)=>{
   if(generation!==cameraGeneration){controls.stop();return;}
   if(!result)return;
   const text=result.getText();
   const id=normalize(text.startsWith('HEREAI:')?text.slice(7):text);
   const person=state.people.find(p=>p.id===id);
   if(!person){$('camera-status').textContent='QR scanned, but the student ID is not enrolled in this browser. Add the person first.';return;}
   controls.stop();stopCamera('QR scanned. Attendance recorded; camera stopped.');
   const entry=mark(person);if(entry.created){entry.record.method='camera-qr';save();}
   confirmation(person,entry);
  });
  if(generation!==cameraGeneration){controls.stop();return;}
  scannerControls=controls;$('camera-status').textContent='Camera live. Hold a HereAI QR code steady in front of the lens.';
 }catch(error){
  if(generation!==cameraGeneration)return;
  const message=error.name==='NotAllowedError'?'Camera permission was denied. Allow camera access in browser site settings and try again.':error.name==='NotFoundError'?'No camera found. Connect a webcam or open this page on your phone.':error.name==='NotReadableError'?'Camera unavailable. Close other apps using it and try again.':'Camera could not start. Check your camera settings and try again.';
  stopCamera(message);
 }
}
function showQR(id){
 const person=state.people.find(p=>p.id===id);if(!person)return;
 qrPerson=person;$('qr-name').textContent=person.name;$('qr-details').textContent=`${person.id} · ${person.className}`;$('qr-code').replaceChildren();$('qr-status').textContent='';$('download-qr').disabled=true;
 $('qr-dialog').showModal();
 if(!window.QRCode){$('qr-status').textContent='QR generator could not load. Check your internet connection and reload.';return;}
 try{new QRCode($('qr-code'),{text:`HEREAI:${person.id}`,width:240,height:240,colorDark:'#06291c',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});$('download-qr').disabled=false;}catch{$('qr-status').textContent='Could not generate this QR code. Try a shorter student ID.';}
}
$('people-table').addEventListener('click',event=>{const button=event.target.closest('[data-qr]');if(button)showQR(button.dataset.qr);});
$('download-qr').onclick=()=>{
 const canvas=$('qr-code').querySelector('canvas');const img=$('qr-code').querySelector('img');const url=canvas?.toDataURL('image/png')||img?.src;
 if(!url){$('qr-status').textContent='QR image is not ready. Try again.';return;}
 const link=document.createElement('a');link.href=url;link.download=`hereai-${qrPerson.id.replace(/[^a-z0-9_-]/gi,'_')}.png`;link.click();
};
$('start-camera').onclick=startCamera;$('stop-camera').onclick=()=>stopCamera();
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.view!=='checkin')stopCamera();}));
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopCamera();});
window.addEventListener('pagehide',()=>stopCamera());
