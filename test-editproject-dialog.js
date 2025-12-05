/**
 * Browser automation script to test EditProjectDialog interactions
 * Run this in browser console at http://localhost:5600
 */

async function testEditProjectDialog() {
  console.log('=== EDITPROJECT DIALOG DEBUG TEST ===\n');

  // Wait for page to be ready
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Step 1: Find the dialog
  const backdrop = document.querySelector('.fixed.inset-0.z-50.bg-black\\/50');
  const dialog = document.querySelector('.fixed.z-\\[51\\].bg-\\[\\#1f2330\\]');

  console.log('1. DIALOG ELEMENTS:');
  console.log('   Backdrop found:', !!backdrop);
  console.log('   Dialog found:', !!dialog);

  if (!dialog) {
    console.error('   ❌ Dialog not found! Make sure you opened a project first.');
    return;
  }

  // Step 2: Check z-index values
  console.log('\n2. Z-INDEX VALUES:');
  console.log('   Backdrop z-index:', window.getComputedStyle(backdrop).zIndex);
  console.log('   Dialog z-index:', window.getComputedStyle(dialog).zIndex);

  // Find header, tabs, content
  const header = dialog.querySelector('.cursor-move');
  const tabsContainer = dialog.querySelector('.border-b.border-\\[\\#3d4457\\].bg-\\[\\#1f2330\\]');
  const content = dialog.querySelector('.flex-1.overflow-y-auto');

  if (header) console.log('   Header z-index:', window.getComputedStyle(header).zIndex);
  if (tabsContainer) console.log('   Tabs z-index:', window.getComputedStyle(tabsContainer).zIndex);
  if (content) console.log('   Content z-index:', window.getComputedStyle(content).zIndex);

  // Step 3: Check resize handles
  console.log('\n3. RESIZE HANDLES:');
  const resizeHandles = dialog.querySelectorAll('[class*="cursor-"][class*="resize"]');
  console.log('   Found resize handles:', resizeHandles.length);
  resizeHandles.forEach((handle, idx) => {
    const computed = window.getComputedStyle(handle);
    console.log(`   Handle ${idx}: z-index=${computed.zIndex}, position=${computed.position}, display=${computed.display}`);
  });

  // Step 4: Check tabs
  console.log('\n4. TAB BUTTONS:');
  const tabs = dialog.querySelectorAll('button[class*="border-b-2"]');
  console.log('   Found tab buttons:', tabs.length);
  tabs.forEach((tab, idx) => {
    const computed = window.getComputedStyle(tab);
    console.log(`   Tab ${idx}: z-index=${computed.zIndex}, pointer-events=${computed.pointerEvents}, position=${computed.position}`);
  });

  // Step 5: Check stacking context
  console.log('\n5. STACKING CONTEXT:');
  const checkStacking = (element, name) => {
    const computed = window.getComputedStyle(element);
    console.log(`   ${name}:`);
    console.log(`     position: ${computed.position}`);
    console.log(`     z-index: ${computed.zIndex}`);
    console.log(`     transform: ${computed.transform}`);
    console.log(`     isolation: ${computed.isolation}`);
  };

  if (header) checkStacking(header, 'Header');
  if (tabsContainer) checkStacking(tabsContainer, 'Tabs Container');
  if (content) checkStacking(content, 'Content');

  // Step 6: Test click on first tab
  console.log('\n6. CLICK TEST:');
  if (tabs.length > 0) {
    const firstTab = tabs[0];
    const rect = firstTab.getBoundingClientRect();
    console.log('   First tab position:', { top: rect.top, left: rect.left, width: rect.width, height: rect.height });

    // Check what element is at the tab position
    const elementAtTabCenter = document.elementFromPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    );
    console.log('   Element at tab center:', elementAtTabCenter?.tagName, elementAtTabCenter?.className);
    console.log('   Is it the tab button?', elementAtTabCenter === firstTab || firstTab.contains(elementAtTabCenter));

    // Check if resize handle is on top
    const isResizeHandle = elementAtTabCenter?.className?.includes('resize');
    console.log('   Is resize handle blocking?', isResizeHandle);
  }

  // Step 7: Check event listeners
  console.log('\n7. EVENT LISTENERS:');
  const backdropListeners = getEventListeners(backdrop);
  console.log('   Backdrop listeners:', Object.keys(backdropListeners));
  if (backdropListeners.click) {
    console.log('     Click listeners:', backdropListeners.click.length);
    backdropListeners.click.forEach((listener, idx) => {
      console.log(`       ${idx}: useCapture=${listener.useCapture}`);
    });
  }

  // Step 8: Input field test
  console.log('\n8. INPUT FIELD TEST:');
  const inputs = dialog.querySelectorAll('input, textarea, select');
  console.log('   Found input fields:', inputs.length);
  if (inputs.length > 0) {
    const firstInput = inputs[0];
    const rect = firstInput.getBoundingClientRect();
    const elementAtInput = document.elementFromPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    );
    console.log('   First input element:', firstInput.tagName, firstInput.type);
    console.log('   Element at input center:', elementAtInput?.tagName, elementAtInput?.className);
    console.log('   Is it the input?', elementAtInput === firstInput || firstInput.contains(elementAtInput));
  }

  console.log('\n=== TEST COMPLETE ===');
}

// Auto-run after 2 seconds
setTimeout(() => {
  console.log('Starting EditProjectDialog debug test in 2 seconds...');
  console.log('Make sure you have opened a project to show the dialog!\n');
}, 100);

setTimeout(testEditProjectDialog, 2000);
