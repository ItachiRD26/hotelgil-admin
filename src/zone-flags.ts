/**
 * Prevents Angular change detection from
 * running with certain Web Component callbacks
 * 
 * NOTA: Deshabilitado porque causaba que los eventos de click
 * no funcionaran en los componentes de Ionic (ion-button, ion-select, etc.)
 */
// eslint-disable-next-line no-underscore-dangle
// (window as any).__Zone_disable_customElements = true;
