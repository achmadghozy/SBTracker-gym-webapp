export function swipeClose(node: HTMLElement, { onClose }: { onClose: () => void }) {
  let startY = 0;
  let currentY = 0;
  let isDragging = false;

  function handlePointerDown(e: PointerEvent) {
    // If the user is scrolling inside a scrollable area, don't hijack it unless they are at the top
    const scrollable = (e.target as Element).closest('.scrollable, input, textarea');
    if (scrollable && scrollable.scrollTop > 0) {
      return;
    }

    startY = e.clientY;
    currentY = e.clientY;
    isDragging = true;
    node.style.transition = 'none';
    node.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDragging) return;
    currentY = e.clientY;
    const deltaY = currentY - startY;

    // Only allow dragging downwards
    if (deltaY > 0) {
      node.style.transform = `translateY(${deltaY}px)`;
    } else {
      node.style.transform = `translateY(0px)`;
    }
  }

  function handlePointerUp(e: PointerEvent) {
    if (!isDragging) return;
    isDragging = false;
    node.releasePointerCapture(e.pointerId);

    const deltaY = currentY - startY;
    if (deltaY > 100) { // Threshold to close
      node.style.transform = `translateY(100%)`;
      node.style.transition = 'transform 0.2s ease-out';
      setTimeout(onClose, 200);
    } else {
      node.style.transform = '';
      node.style.transition = 'transform 0.2s ease-out';
    }
  }

  node.addEventListener('pointerdown', handlePointerDown);
  node.addEventListener('pointermove', handlePointerMove);
  node.addEventListener('pointerup', handlePointerUp);
  node.addEventListener('pointercancel', handlePointerUp);

  return {
    destroy() {
      node.removeEventListener('pointerdown', handlePointerDown);
      node.removeEventListener('pointermove', handlePointerMove);
      node.removeEventListener('pointerup', handlePointerUp);
      node.removeEventListener('pointercancel', handlePointerUp);
    }
  };
}
