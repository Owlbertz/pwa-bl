!function(){var t=null,n=null,e=40;document.addEventListener("touchstart",function(e){t=e.touches[0].clientX,n=e.touches[0].clientY},!1),document.addEventListener("touchmove",function(u){if(t&&n){var c,a=u.touches[0].clientX,i=u.touches[0].clientY,o=t-a,l=n-i;if(Math.abs(o)<e&&Math.abs(l)<e)return!1;if(c=Math.abs(o)>Math.abs(l)?o>0?"left":"right":l>0?"up":"down"){var s=new Event("swipe"+c);document.dispatchEvent(s)}t=null,n=null}},!1)}();