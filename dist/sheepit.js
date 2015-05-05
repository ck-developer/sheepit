
/**
 * SheepIt! Jquery Plugin
 * http://www.mdelrosso.com/sheepit/
#
 * @version 1.1.1
#
 * Created By Mariano Del Rosso (http://www.mdelrosso.com)
#
 * Thanks to:
 *  Hubert Galuszka: Continuous index option and support for tabular forms
 *  Gabriel Alonso: Bugfixes
#
 * @license
 * 
 * SheepIt is free software: you can redistribute it and/or modify
 * it under the terms of the MIT license
 * 
 * SheepIt is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * MIT license for more details.
 * 
 * You should have received a copy of the MIT license
 * along with SheepIt.  If not, see <http://en.wikipedia.org/wiki/MIT_License>.
 */
(function($) {
  jQuery.fn.sheepIt = function(options) {

    /**
     * Gets the first element of the collection and decorates with jquery
     */
    var add, addForm, addN, addNButton, addNForms, addNInput, canAddForm, canRemoveAllForms, canRemoveForm, clickOnAdd, clickOnAddN, clickOnRemoveAll, clickOnRemoveCurrent, clickOnRemoveLast, cloneTemplate, controls, count, current, defaults, extendControl, extendForm, extendSource, fillData, fillForm, fillFormField, first, formFields, forms, getCurrentForm, getFirstForm, getForm, getForms, getFormsCount, getIndex, getIndexForPosition, getLabelForForm, getLastForm, getNextForm, getOptions, getOrSetTemplate, getPositionForIndex, getPreviousForm, getSeparator, hasForms, hasSeparator, initialize, ip, isInDom, last, next, noFormsTemplate, normalizeAll, normalizeControls, normalizeFieldsForForm, normalizeForm, normalizeForms, normalizeLabelsForForm, normalizeOptions, previous, removeAll, removeAllForms, removeCurrent, removeCurrentForm, removeForm, removeLast, removeLastForm, setLabelForForm, setOptions, setPointerTo, source, template, templateForm;
    source = $(this).first();

    /**
     * Clone the form template
     */
    cloneTemplate = function() {
      var clone;
      clone = void 0;
      if (typeof options.beforeClone === 'function') {
        options.beforeClone(source, template);
      }
      clone = template.cloneWithAttribut(true);
      if (typeof options.afterClone === 'function') {
        options.afterClone(source, clone);
      }
      clone.getSource = function() {
        return source;
      };
      return clone;
    };

    /**
     * Handle click on addForm button
     */
    clickOnAdd = function(event) {
      event.preventDefault();
      addForm();
    };

    /**
     * Handle click on addNForm button
     */
    clickOnAddN = function(event) {
      event.preventDefault();
      if (addNInput.value !== '') {
        addNForms(addNInput.attr('value'));
      }
    };

    /**
     * Handle click on Remove current button
     */
    clickOnRemoveCurrent = function(event) {
      event.preventDefault();
      if (typeof options.beforeRemoveCurrent === 'function') {
        options.beforeRemoveCurrent(source);
      }
      if (options.removeCurrentConfirmation) {
        if (confirm(options.removeCurrentConfirmationMsg)) {
          removeCurrentForm($(this).data('removableClone'));
        }
      } else {
        removeCurrentForm($(this).data('removableClone'));
      }
      if (typeof options.afterRemoveCurrent === 'function') {
        options.afterRemoveCurrent(source);
      }
    };

    /**
     * Handle click on Remove last control
     */
    clickOnRemoveLast = function(event) {
      event.preventDefault();
      if (options.removeLastConfirmation) {
        if (confirm(options.removeLastConfirmationMsg)) {
          removeLastForm();
        }
      } else {
        removeLastForm();
      }
    };

    /**
     * Handle click on Remove all control
     */
    clickOnRemoveAll = function(event) {
      event.preventDefault();
      if (options.removeAllConfirmation) {
        if (confirm(options.removeAllConfirmationMsg)) {
          removeAllForms();
        }
      } else {
        removeAllForms();
      }
    };
    getOrSetTemplate = function(element, attrname) {
      var att, template;
      template = element.attr(attrname + 'template');
      if (template) {
        return unescape(template);
      }
      att = element.attr(attrname);
      element.attr(attrname + 'template', escape(att));
      return att;
    };

    /**
     * Get a form and normalize fields id and names to match the current position
     */
    normalizeFieldsForForm = function(form, index) {
      form.find(formFields).each(function() {
        var idAttr, idTemplateAttr, nameAttr, nameTemplateAttr, newIdAttr, newNameAttr, that;
        that = $(this);
        idTemplateAttr = getOrSetTemplate(that, 'id');
        nameTemplateAttr = getOrSetTemplate(that, 'name');
        idAttr = that.attr('id');
        nameAttr = that.attr('name');

        /* Normalize field name attributes */
        newNameAttr = nameTemplateAttr.replace(options.indexFormat, index);
        that.attr('name', newNameAttr);

        /* Normalize field id attributes */
        newIdAttr = idTemplateAttr.replace(options.indexFormat, index);
        form.find('label[for=\'' + idAttr + '\']').each(function() {
          $(this).attr('for', newIdAttr);
        });
        that.attr('id', newIdAttr);
      });
    };
    normalizeLabelsForForm = function(form, index) {
      setLabelForForm(form, index + 1);
    };
    setLabelForForm = function(form, label) {
      form.find(options.labelSelector).html(label);
      return true;
    };
    getLabelForForm = function(form) {
      return form.find(options.labelSelector).html();
    };

    /**
     * Show/Hide controls according to current state of the forms
     */
    normalizeControls = function() {
      var removeCurrents;
      if (hasForms()) {
        if (getFormsCount() === 1) {
          removeAll.hideIf();
          removeLast.showIf();
        } else {
          removeAll.showIf();
          removeLast.showIf();
        }
        removeCurrents = '';
        if (options.allowRemoveCurrent) {
          removeCurrents = source.find(options.removeCurrentSelector);
          if (canRemoveForm()) {
            removeCurrents.show();
          } else {
            removeCurrents.hide();
          }
        } else {
          removeCurrents = source.find(options.removeCurrentSelector);
          removeCurrents.hide();
        }
      } else {
        removeLast.hideIf();
        removeAll.hideIf();
      }
      if (!canAddForm()) {
        add.hideIf();
        addN.hideIf();
      } else {
        add.showIf();
        addN.showIf();
      }
      if (!canRemoveForm()) {
        removeLast.hideIf();
        removeAll.hideIf();
      }
      if (add.css('display') !== 'none' || addN.css('display') !== 'none' || removeAll.css('display') !== 'none' || removeLast.css('display') !== 'none') {
        controls.show();
      } else {
        controls.hide();
      }
    };

    /**
     * Show/hide noFormsMsg
     */
    normalizeForms = function() {
      var form, index;
      if (hasForms()) {
        noFormsTemplate.hide();
        if (options.continuousIndex) {
          index = 0;
          form = getFirstForm();
          while (true) {
            normalizeForm(form, index);
            index++;
            form = getNextForm(form);
            if (form === false) {
              break;
            }
          }
        }
      } else {
        noFormsTemplate.show();
      }
    };
    normalizeForm = function(form, index) {
      var idTemplate, re, removeCurrent;
      if (typeof index === 'undefined') {
        index = getIndex();
      }
      idTemplate = getOrSetTemplate(form, 'id');
      if (form.attr('id')) {
        form.attr('id', idTemplate + index);
      }
      normalizeFieldsForForm(form, index);
      normalizeLabelsForForm(form, index);
      if (form.html().indexOf(options.indexFormat) !== -1) {
        re = new RegExp(options.indexFormat, 'ig');
        form.html(form.html().replace(re, index));
      }
      removeCurrent = form.find(options.removeCurrentSelector);
      if (options.allowRemoveCurrent) {
        removeCurrent.show();
      } else {
        removeCurrent.hide();
      }
      return form;
    };

    /**
     * Normalize all (Controls, Forms)
     */
    normalizeAll = function() {
      normalizeForms();
      normalizeControls();
    };

    /**
     * Add a new form to the collection
     * 
     * @parameter normalize: avoid normalize all forms if not necessary
     */
    addForm = function(normalizeAllafterAdd, form) {
      var id, lastForm, nestedForm, nestedForms, newForm, removeCurrentBtn, separator, x;
      if (typeof normalizeAllafterAdd === 'undefined') {
        normalizeAllafterAdd = true;
      }
      if (typeof form === 'undefined') {
        form = false;
      }
      if (typeof options.beforeAdd === 'function') {
        options.beforeAdd(source);
      }
      newForm = false;
      if (form) {
        if (typeof form === 'string') {
          newForm = $('#' + form);
        } else if (typeof form === 'object') {
          newForm = form;
        } else {
          return false;
        }
        newForm.remove();
      } else {
        newForm = cloneTemplate();
      }
      if (canAddForm() && newForm) {
        newForm = normalizeForm(newForm);
        removeCurrentBtn = newForm.find(options.removeCurrentSelector).first();
        removeCurrentBtn.click(clickOnRemoveCurrent);
        removeCurrentBtn.data('removableClone', newForm);
        newForm.data('formIndex', getIndex());
        newForm.data('previousSeparator', false);
        newForm.data('nextSeparator', false);
        newForm.data('previousForm', false);
        newForm.data('nextForm', false);
        if (hasForms()) {
          lastForm = getLastForm();
          lastForm.data('nextForm', newForm);
          newForm.data('previousForm', lastForm);
          if (options.separator) {
            separator = getSeparator();
            separator.insertAfter(lastForm);
            lastForm.data('nextSeparator', separator);
            newForm.data('previousSeparator', separator);
          }
        }
        if (options.insertNewForms === 'after') {
          newForm.insertBefore(noFormsTemplate);
        } else {
          newForm.insertAfter(noFormsTemplate);
        }
        if (options.nestedForms.length > 0) {
          x = 0;
          nestedForms = [];
          for (x in options.nestedForms) {
            x = x;
            if (typeof options.nestedForms[x].id !== 'undefined' && typeof options.nestedForms[x].options !== 'undefined') {
              options.nestedForms[x].isNestedForm = true;
              options.nestedForms[x].parentForm = source;
              id = options.nestedForms[x].id.replace(options.indexFormat, newForm.data('formIndex'));
              nestedForm = $('#' + id).sheepIt(options.nestedForms[x].options);
              nestedForms.push(nestedForm);
            }
          }
          newForm.data('nestedForms', nestedForms);
        }
        extendForm(newForm);
        forms.push(newForm);

        /**
         * If index has to be continuous,
         * all items are reindexed/renumbered using 
         * normalizeAll() after add a new form clone
         */
        if (normalizeAllafterAdd || options.continuousIndex) {
          normalizeAll();
        }
        if (typeof options.afterAdd === 'function') {
          options.afterAdd(source, newForm);
        }
        return true;
      } else {
        return false;
      }
    };
    addNForms = function(n, normalize) {
      var x;
      if (typeof n !== 'undefined') {
        n = parseFloat(n);
        x = 1;
        x = 1;
        while (x <= n) {
          addForm(normalize);
          x++;
        }
      }
    };
    removeLastForm = function(normalize) {
      if (typeof normalize === 'undefined') {
        normalize = true;
      }
      if (canRemoveForm()) {
        removeForm();
        if (normalize) {
          normalizeAll();
        }
        return true;
      } else {
        return false;
      }
    };
    removeAllForms = function(normalize) {
      var x;
      if (typeof normalize === 'undefined') {
        normalize = true;
      }
      if (canRemoveAllForms()) {
        x = [];
        for (x in forms) {
          x = x;
          if (forms[x]) {
            removeForm(forms[x]);
          }
        }
        if (normalize) {
          normalizeAll();
        }
        return true;
      } else {
        return false;
      }
    };
    removeCurrentForm = function(formToRemove, normalize) {
      if (typeof normalize === 'undefined') {
        normalize = true;
      }
      if (canRemoveForm()) {
        removeForm(formToRemove);
        if (normalize) {
          normalizeAll();
        }
        return true;
      } else {
        return false;
      }
    };

    /**
     * Remove form from the index and DOM
     */
    removeForm = function(formToRemove) {
      var index;
      if (typeof formToRemove === 'undefined') {
        formToRemove = getLastForm();
      }
      index = formToRemove.data('formIndex');

      /**
       * Remove separator?
       */
      if (formToRemove.data('previousSeparator') && formToRemove.data('nextSeparator')) {
        formToRemove.data('previousSeparator').remove();
        formToRemove.data('previousForm').data('nextSeparator', formToRemove.data('nextSeparator'));
      } else if (formToRemove.data('previousSeparator') && !formToRemove.data('nextSeparator')) {
        formToRemove.data('previousSeparator').remove();
        formToRemove.data('previousForm').data('nextSeparator', false);
      } else if (!formToRemove.data('previousSeparator') && formToRemove.data('nextSeparator')) {
        formToRemove.data('nextSeparator').remove();
        formToRemove.data('nextForm').data('previousSeparator', false);
      }
      if (formToRemove.data('previousForm')) {
        formToRemove.data('previousForm').data('nextForm', formToRemove.data('nextForm'));
      }
      if (formToRemove.data('nextForm')) {
        formToRemove.data('nextForm').data('previousForm', formToRemove.data('previousForm'));
      }
      forms[index] = false;
      formToRemove.remove();
      return true;
    };

    /*---------------- ITERATOR METHODS ---------------- */

    /**
     * Gets the current internal pointer
     */
    current = function() {
      return ip;
    };

    /**
     * Increment the internal pointer
     */
    next = function() {
      var i, init, ip;
      if (ip !== false) {
        if (forms.length > 1) {
          i = 0;
          init = parseFloat(ip + 1);
          i = init;
          while (i < forms.length) {
            if (forms[i]) {
              ip = i;
              return true;
            }
            i++;
          }
          return false;
        } else {
          return false;
        }
      } else {
        return false;
      }
    };

    /**
     * Decrement the internal pointer
     */
    previous = function() {
      var i, init, ip;
      if (ip !== false) {
        if (forms.length > 1) {
          i = 0;
          init = parseFloat(ip - 1);
          i = init;
          while (i >= 0) {
            if (forms[i]) {
              ip = i;
              return true;
            }
            i--;
          }
          return false;
        } else {
          return false;
        }
      } else {
        return false;
      }
    };

    /**
     * Brings the internal pointer to the first element
     */
    first = function() {
      var ip, x;
      ip = false;
      if (forms.length > 0) {
        x = 0;
        for (x in forms) {
          x = x;
          if (forms[x]) {
            ip = x;
            return true;
          }
        }
        return false;
      } else {
        return false;
      }
    };

    /**
     * Brings the internal pointer to the last element
     */
    last = function() {
      var i, ip;
      ip = false;
      if (forms.length > 0) {
        if (forms[forms.length - 1]) {
          ip = forms.length - 1;
          return true;
        } else {
          i = 0;
          i = forms.length - 1;
          while (i >= 0) {
            if (forms[i]) {
              ip = i;
              return true;
            }
            i--;
          }
          return false;
        }
      } else {
        return false;
      }
    };

    /**
     * Count the current elements
     */
    count = function() {
      var count;
      var x;
      if (forms.length > 0) {
        count = 0;
        x = [];
        for (x in forms) {
          x = x;
          if (forms[x]) {
            count++;
          }
        }
        return count;
      } else {
        return 0;
      }
    };

    /**
     * Sets the pointer to a new position
     */
    setPointerTo = function(position) {
      var ip;
      if (typeof position !== 'undefined') {
        ip = getIndexForPosition(position);
        if (ip !== false) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    };

    /**
     * Get the "real" index for a given position
     */
    getIndexForPosition = function(position) {
      var count;
      var index, x;
      x = 0;
      count = 0;
      index = false;
      for (x in forms) {
        x = x;
        if (forms[x]) {
          count++;
          if (position === count) {
            index = x;
          }
        }
      }
      return index;
    };
    getPositionForIndex = function(index) {
      var position, x;
      x = 0;
      position = 0;
      x = 0;
      while (x <= index) {
        if (forms[x]) {
          position++;
        }
        x++;
      }
      return position;
    };

    /**
     * Get the current index (Forms array length)
     */
    getIndex = function() {
      return forms.length;
    };

    /*---------------- /ITERATOR METHODS ---------------- */
    getFormsCount = function() {
      return count();
    };
    getFirstForm = function() {
      if (first() !== false) {
        return getCurrentForm();
      } else {
        return false;
      }
    };
    getLastForm = function() {
      if (last() !== false) {
        return getCurrentForm();
      } else {
        return false;
      }
    };
    getNextForm = function(form) {
      if (form) {
        return form.data('nextForm');
      } else if (current() !== false) {
        if (next() !== false) {
          return getCurrentForm();
        } else {
          return false;
        }
      } else {
        return false;
      }
    };
    getPreviousForm = function(form) {
      if (form) {
        return form.data('previousForm');
      } else if (current() !== false) {
        if (previous() !== false) {
          return getCurrentForm();
        } else {
          return false;
        }
      } else {
        return false;
      }
    };

    /**
     * Get the current form based on the interal pointer
     */
    getCurrentForm = function() {
      if (current() !== false) {
        return forms[current()];
      } else {
        return false;
      }
    };

    /**
     * Get a form by its position
     */
    getForm = function(position) {
      if (hasForms()) {
        if (typeof position !== 'undefined') {
          setPointerTo(position);
          return getCurrentForm();
        } else {
          return getLastForm();
        }
      } else {
        return false;
      }
    };

    /**
     * Get active forms
     */
    getForms = function() {
      var activeForms, x;
      if (hasForms()) {
        first();
        x = 0;
        activeForms = [];
        x = 0;
        while (x < getFormsCount()) {
          activeForms.push(getCurrentForm());
          next();
          x++;
        }
        return activeForms;
      } else {
        return false;
      }
    };
    hasForms = function() {
      if (getFormsCount() > 0) {
        return true;
      } else {
        return false;
      }
    };
    canAddForm = function() {
      if (options.maxFormsCount === 0) {
        return true;
      } else {
        if (getFormsCount() < options.maxFormsCount) {
          return true;
        } else {
          return false;
        }
      }
    };

    /**
     * Checks if can remove any form
     */
    canRemoveForm = function() {
      if (getFormsCount() > options.minFormsCount) {
        return true;
      } else {
        return false;
      }
    };
    canRemoveAllForms = function() {
      if (options.minFormsCount === 0) {
        return true;
      } else {
        return false;
      }
    };
    isInDom = function(object) {
      if ($('#' + object.attr('id')).length > 0) {
        return true;
      } else {
        return false;
      }
    };

    /**
     * Controls the whole process of data injection
    #
     */
    fillData = function(index, values) {
      var form;
      form = '';
      if (typeof index === 'number') {
        index++;
        if (index > getFormsCount()) {
          addForm();
        }
        form = getForm(index);
        fillForm(form, values);
      } else if (typeof index === 'string') {
        form = $('#' + index);
        fillForm(form, values);
      }
      if (typeof options.afterFill === 'function') {
        options.afterFill(source, form, values);
      }
    };
    fillForm = function(form, data) {
      var x;
      x = 0;
      $.each(data, function(index, value) {
        var field, fieldsToFill, formId, formIndex, mf, mv;
        formId = source.attr('id');
        formIndex = form.data('formIndex');
        if (index.indexOf('#form#') !== -1 || index.indexOf('#index#') !== -1) {
          index = index.replace('#form#', formId);
          index = index.replace('#index#', formIndex);
        } else {
          index = formId + '_' + formIndex + '_' + index;
        }

        /**
         * Search for field (by id, by name, etc)
         */
        field = form.find(':input[id="' + index + '"]');
        if (field.length === 0) {
          field = form.find(':input[name="' + index + '"]');
          if (field.length === 0) {
            field = form.find(':input[name="' + index + '[]"]');
          }
        }
        if (field.length > 0) {
          mv = false;
          if (typeof value === 'object') {
            mv = true;
          }
          mf = false;
          if (field.length > 1) {
            mf = true;
          }
          if (mf) {
            if (mv) {
              fieldsToFill = [];
              fieldsToFill['fields'] = [];
              fieldsToFill['values'] = [];
              x = 0;
              for (x in value) {
                x = x;
                fieldsToFill['fields'].push(field.filter('[value="' + value[x] + '"]'));
                fieldsToFill['values'].push(value[x]);
              }
              x = 0;
              for (x in fieldsToFill['fields']) {
                x = x;
                fillFormField(fieldsToFill['fields'][x], fieldsToFill['values'][x]);
              }
            } else {
              fillFormField(field.filter('[value="' + value + '"]', value));
            }
          } else {
            if (mv) {
              x = 0;
              for (x in value) {
                x = x;
                fillFormField(field, value[x]);
              }
            } else {
              fillFormField(field, value);
            }
          }
        } else {
          if (typeof form.data('nestedForms') !== 'undefined') {
            if (form.data('nestedForms').length > 0) {
              x = 0;
              for (x in form.data('nestedForms')) {
                x = x;
                if (index === form.data('nestedForms')[x].attr('id') && typeof value === 'object') {
                  form.data('nestedForms')[x].inject(value);
                }
              }
            }
          }
        }
      });
    };
    fillFormField = function(field, value) {
      var type;
      type = field.attr('type');
      if (type === 'text' || type === 'hidden' || type === 'password') {
        field.attr('value', value);
        return true;
      } else if (type === 'textarea') {
        field.text(value);
        return true;
      } else if (type === 'checkbox' || type === 'radio') {
        field.attr('checked', 'checked');
        return true;
      } else if (type === 'select-one' || type === 'select-multiple') {
        field.find('option').each(function() {
          if ($(this).text() === value || $(this).attr('value') === value) {
            $(this).attr('selected', 'selected');
          }
        });
        return true;
      } else {
        return false;
      }
    };
    hasSeparator = function() {
      if (options.separator !== '') {
        return true;
      } else {
        return false;
      }
    };
    getSeparator = function() {
      if (hasSeparator()) {
        return $(options.separator);
      } else {
        return false;
      }
    };
    setOptions = function(newOptions) {
      options = [];
      options = $.extend(defaults, newOptions);
      normalizeOptions(options);
    };
    getOptions = function() {
      return options;
    };
    initialize = function() {
      var add, addN, addNButton, addNInput, b, controls, noFormsTemplate, removeAll, removeCurrent, removeLast, template, templateForm, x;
      source.hide();

      /**
       * Controls
       */
      add = $(options.addSelector);
      addN = $(options.addNSelector);
      addNInput = $(options.addNInputSelector);
      addNButton = $(options.addNButtonSelector);
      removeLast = $(options.removeLastSelector);
      removeCurrent = $(options.removeCurrentSelector);
      removeAll = $(options.removeAllSelector);
      controls = $(options.controlsSelector);
      if (add.length === 0) {
        options.allowAdd = false;
      }
      if (addN.length === 0) {
        options.allowAddN = false;
      }
      if (removeLast.length === 0) {
        options.allowRemoveLast = false;
      }
      if (removeAll.length === 0) {
        options.allowRemoveAll = false;
      }
      extendControl(add, options.allowAdd, clickOnAdd);
      extendControl(addN, options.allowAddN, clickOnAddN, addNButton);
      extendControl(removeLast, options.allowRemoveLast, clickOnRemoveLast);
      extendControl(removeAll, options.allowRemoveAll, clickOnRemoveAll);
      add.init();
      addN.init();
      removeLast.init();
      removeAll.init();

      /**
       * Templates
       */
      templateForm = $(options.formTemplateSelector);
      noFormsTemplate = $(options.noFormsTemplateSelector);
      template = templateForm.cloneWithAttribut(true);
      templateForm.remove();

      /**
       * Forms initialization
       */
      x = 0;
      if (options.pregeneratedForms.length > 0) {
        x = 0;
        for (x in options.pregeneratedForms) {
          x = x;
          addForm(false, options.pregeneratedForms[x]);
        }
      }
      if (options.iniFormsCount > getFormsCount()) {
        x = 0;
        b = options.iniFormsCount - getFormsCount();
        x = 1;
        while (x <= b) {
          addForm(false);
          x++;
        }
      }

      /**
       * Data injection
       */
      if (options.data) {
        source.inject(options.data);
      }
      normalizeAll();
      source.show();
    };

    /**
     * Extend passed control with new methods used by this plugin
     */
    extendControl = function(control, allowControlOption, onClickFunction, onClickSubControl) {

      /**
       * onClickSubControl es utilizado cuando el control principal no es el que recibe el click
       */
      if (typeof onClickSubControl === 'undefined') {
        onClickSubControl = false;
      }
      $.extend(control, {
        hideIf: function(duration, callback) {
          if (allowControlOption) {
            control.hide(duration, callback);
          }
        },
        showIf: function(duration, callback) {
          if (allowControlOption) {
            control.show(duration, callback);
          }
        },
        init: function() {
          if (allowControlOption) {
            if (onClickSubControl) {
              onClickSubControl.click(onClickFunction);
            } else {
              control.click(onClickFunction);
            }
            control.show();
          } else {
            control.hide();
          }
        }
      });
    };

    /**
     * Extends source object with many useful methods,
     * used to control sheepIt forms with javascript
     */
    extendSource = function(source) {
      $.extend(source, {
        getAddControl: function() {
          return add;
        },
        getAddNControl: function() {
          return addN;
        },
        getRemoveLastControl: function() {
          return removeLast;
        },
        getRemoveAllControl: function() {
          return removeAll;
        },
        getOptions: function() {
          return getOptions();
        },
        getOption: function(option) {
          return options[option];
        },
        setOption: function(option, value) {
          if (typeof option !== 'undefined' && typeof value !== 'undefined') {
            options[option] = value;
            return options[option];
          } else {
            return false;
          }
        },
        getForms: function() {
          return getForms();
        },
        getAllForms: function() {
          return getForms();
        },
        getForm: function(val) {
          if (typeof val !== 'undefined') {
            val++;
          }
          return getForm(val);
        },
        getLastForm: function() {
          return getForm();
        },
        getFirstForm: function() {
          first();
          return getCurrentForm();
        },
        addForm: function() {
          return addForm();
        },
        addNForms: function(n) {
          return addNForms(n);
        },
        getFormsCount: function() {
          return getFormsCount();
        },
        hasForms: function() {
          return hasForms();
        },
        canAddForm: function() {
          return canAddForm();
        },
        canRemoveAllForms: function() {
          return canRemoveAllForms();
        },
        canRemoveForm: function() {
          return canRemoveForm();
        },
        removeAllForms: function() {
          return removeAllForms();
        },
        removeLastForm: function() {
          return removeLastForm();
        },
        removeFirstForm: function() {
          first();
          return removeForm(getCurrentForm());
        },
        removeForm: function(val) {
          if (typeof val !== 'undefined') {
            val++;
          }
          return removeForm(getForm(val));
        },
        inject: function(data) {
          $.each(data, $.proxy(fillData, source));
        }
      });
    };

    /**
     * Extends cloned forms with many useful methods,
     * used to control each form with javascript
     */
    extendForm = function(form) {
      $.extend(form, {
        setLabel: function(newLabel) {
          return setLabelForForm(form, newLabel);
        },
        getLabel: function() {
          return getLabelForForm(form);
        },
        inject: function(data) {
          fillForm(form, data);
        },
        getNestedForms: function() {
          return form.data('nestedForms');
        },
        getNestedForm: function(val) {
          return form.data('nestedForms')[val];
        },
        getPosition: function() {
          return getPositionForIndex(form.data('formIndex'));
        },
        getPreviousForm: function() {
          return getPreviousForm(form);
        },
        getNextForm: function() {
          return getNextForm(form);
        },
        removeForm: function() {
          return removeForm(form);
        }
      });
    };

    /**
     * Normalize options
     */
    normalizeOptions = function(options) {
      if (options.maxFormsCount > 0) {
        if (options.maxFormsCount < options.minFormsCount) {
          options.maxFormsCount = options.minFormsCount;
        }
        if (options.iniFormsCount < options.minFormsCount || options.iniFormsCount > options.maxFormsCount) {
          options.iniFormsCount = options.minFormsCount;
        }
      } else {
        if (options.iniFormsCount < options.minFormsCount) {
          options.iniFormsCount = options.minFormsCount;
        }
      }
      if (!canRemoveAllForms()) {
        options.allowRemoveAll = false;
      }
    };
    extendSource(source);
    add = void 0;
    addN = void 0;
    addNInput = void 0;
    addNButton = void 0;
    removeLast = void 0;
    removeCurrent = void 0;
    removeAll = void 0;
    controls = void 0;
    template = void 0;
    templateForm = void 0;
    noFormsTemplate = void 0;
    formFields = 'input, checkbox, select, textarea';
    forms = [];
    ip = false;
    defaults = {
      addSelector: '#' + $(this).attr('id') + '_add',
      addNSelector: '#' + $(this).attr('id') + '_add_n',
      addNInputSelector: '#' + $(this).attr('id') + '_add_n_input',
      addNButtonSelector: '#' + $(this).attr('id') + '_add_n_button',
      removeLastSelector: '#' + $(this).attr('id') + '_remove_last',
      removeCurrentSelector: '#' + $(this).attr('id') + '_remove_current',
      removeAllSelector: '#' + $(this).attr('id') + '_remove_all',
      controlsSelector: '#' + $(this).attr('id') + '_controls',
      labelSelector: '#' + $(this).attr('id') + '_label',
      allowRemoveLast: true,
      allowRemoveCurrent: true,
      allowRemoveAll: false,
      allowAdd: true,
      allowAddN: false,
      removeLastConfirmation: false,
      removeCurrentConfirmation: false,
      removeAllConfirmation: true,
      removeLastConfirmationMsg: 'Are you sure?',
      removeCurrentConfirmationMsg: 'Are you sure?',
      removeAllConfirmationMsg: 'Are you sure?',
      formTemplateSelector: '#' + $(this).attr('id') + '_template',
      noFormsTemplateSelector: '#' + $(this).attr('id') + '_noforms_template',
      separator: '<div style="width:100%; border-top:1px solid #ff0000; margin: 10px 0px;"></div>',
      iniFormsCount: 1,
      maxFormsCount: 20,
      minFormsCount: 1,
      incrementCount: 1,
      noFormsMsg: 'No forms to display',
      indexFormat: '#index#',
      data: [],
      pregeneratedForms: [],
      nestedForms: [],
      isNestedForm: false,
      parentForm: {},
      beforeClone: function() {},
      afterClone: function() {},
      beforeAdd: function() {},
      afterAdd: function() {},
      afterFill: function() {},
      afterRemoveCurrent: function() {},
      beforeRemoveCurrent: function() {},
      insertNewForms: 'after',
      continuousIndex: true
    };
    setOptions(options);
    initialize();
    return source;
  };

  /**
   * JQuery original clone method decorated in order to fix an IE < 8 issue
   * where attributs especially name are not copied
   */
  jQuery.fn.cloneWithAttribut = function(withDataAndEvents) {
    var clone;
    if (jQuery.support.noCloneEvent) {
      return $(this).clone(withDataAndEvents);
    } else {
      $(this).find('*').each(function() {
        $(this).data('name', $(this).attr('name'));
      });
      clone = $(this).clone(withDataAndEvents);
      clone.find('*').each(function() {
        $(this).attr('name', $(this).data('name'));
      });
      return clone;
    }
  };
})(jQuery);
