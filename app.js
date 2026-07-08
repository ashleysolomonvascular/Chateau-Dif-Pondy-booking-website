document.addEventListener('DOMContentLoaded',function(){
  // Mobile nav toggle
  const nav = document.getElementById('mainNav');
  const toggle = document.getElementById('navToggle');
  toggle.addEventListener('click',()=>{
    const shown = nav.style.display === 'flex';
    nav.style.display = shown ? '' : 'flex';
  });

  // Gallery lightbox
  const gallery = document.getElementById('galleryGrid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  if(gallery){
    gallery.addEventListener('click', (e)=>{
      const img = e.target.closest('img');
      if(!img) return;
      lightboxImg.src = img.src;
      lightbox.style.display = 'flex';
      lightbox.setAttribute('aria-hidden','false');
    });
  }
  function closeLightbox(){
    lightbox.style.display = 'none';
    lightbox.setAttribute('aria-hidden','true');
    lightboxImg.src = '';
  }
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e)=>{ if(e.target===lightbox) closeLightbox(); });

  // Smooth scroll offset for anchored links (if fixed header)
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const target = document.querySelector(a.getAttribute('href'));
      if(target){ e.preventDefault(); const y = target.getBoundingClientRect().top + window.scrollY - 64; window.scrollTo({top:y,behavior:'smooth'}); }
    });
  });
});
