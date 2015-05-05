###*
# SheepIt! Jquery Plugin
# http://www.mdelrosso.com/sheepit/
#
# @version 1.1.1
#
# Created By Mariano Del Rosso (http://www.mdelrosso.com)
#
# Thanks to:
#  Hubert Galuszka: Continuous index option and support for tabular forms
#  Gabriel Alonso: Bugfixes
#
# @license
# 
# SheepIt is free software: you can redistribute it and/or modify
# it under the terms of the MIT license
# 
# SheepIt is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# MIT license for more details.
# 
# You should have received a copy of the MIT license
# along with SheepIt.  If not, see <http://en.wikipedia.org/wiki/MIT_License>.
###

(($) ->

  jQuery.fn.sheepIt = (options) ->

    ###*
    # Gets the first element of the collection and decorates with jquery
    ###

    source = $(this).first()
    # Extend source with useful methods

    ###*
    # Clone the form template
    ###

    cloneTemplate = ->
      clone = undefined
      # Before clone callBack function
      if typeof options.beforeClone == 'function'
        options.beforeClone source, template
      clone = template.cloneWithAttribut(true)
      # After clone callBack function
      if typeof options.afterClone == 'function'
        options.afterClone source, clone
      # Get source

      clone.getSource = ->
        source

      clone

    ###*
    # Handle click on addForm button
    ###

    clickOnAdd = (event) ->
      event.preventDefault()
      addForm()
      return

    ###*
    # Handle click on addNForm button
    ###

    clickOnAddN = (event) ->
      event.preventDefault()
      if addNInput.value != ''
        addNForms addNInput.attr('value')
      return

    ###*
    # Handle click on Remove current button
    ###

    clickOnRemoveCurrent = (event) ->
      event.preventDefault()
      # Before remove current callBack function
      if typeof options.beforeRemoveCurrent == 'function'
        options.beforeRemoveCurrent source
      if options.removeCurrentConfirmation
        if confirm(options.removeCurrentConfirmationMsg)
          removeCurrentForm $(this).data('removableClone')
      else
        removeCurrentForm $(this).data('removableClone')
      # After remove current callBack function
      if typeof options.afterRemoveCurrent == 'function'
        options.afterRemoveCurrent source
      return

    ###*
    # Handle click on Remove last control
    ###

    clickOnRemoveLast = (event) ->
      event.preventDefault()
      if options.removeLastConfirmation
        if confirm(options.removeLastConfirmationMsg)
          removeLastForm()
      else
        removeLastForm()
      return

    ###*
    # Handle click on Remove all control
    ###

    clickOnRemoveAll = (event) ->
      event.preventDefault()
      if options.removeAllConfirmation
        if confirm(options.removeAllConfirmationMsg)
          removeAllForms()
      else
        removeAllForms()
      return

    getOrSetTemplate = (element, attrname) ->
      template = element.attr(attrname + 'template')
      if template
        return unescape(template)
      att = element.attr(attrname)
      # Hide index occurrences inside the template (todo: better escaping method)      
      element.attr attrname + 'template', escape(att)
      att

    ###*
    # Get a form and normalize fields id and names to match the current position
    ###

    normalizeFieldsForForm = (form, index) ->
      form.find(formFields).each ->
        that = $(this)
        idTemplateAttr = getOrSetTemplate(that, 'id')
        nameTemplateAttr = getOrSetTemplate(that, 'name')
        idAttr = that.attr('id')
        nameAttr = that.attr('name')

        ### Normalize field name attributes ###

        newNameAttr = nameTemplateAttr.replace(options.indexFormat, index)
        that.attr 'name', newNameAttr

        ### Normalize field id attributes ###

        newIdAttr = idTemplateAttr.replace(options.indexFormat, index)
        form.find('label[for=\'' + idAttr + '\']').each ->
          $(this).attr 'for', newIdAttr
          return
        that.attr 'id', newIdAttr
        return
      return

    normalizeLabelsForForm = (form, index) ->
      setLabelForForm form, index + 1
      return

    setLabelForForm = (form, label) ->
      form.find(options.labelSelector).html label
      true

    getLabelForForm = (form) ->
      form.find(options.labelSelector).html()

    ###*
    # Show/Hide controls according to current state of the forms
    ###

    normalizeControls = ->
      # Remove buttons
      if hasForms()
        if getFormsCount() == 1
          removeAll.hideIf()
          removeLast.showIf()
        else
          removeAll.showIf()
          removeLast.showIf()
        # Remove current buttons
        removeCurrents = ''
        if options.allowRemoveCurrent
          removeCurrents = source.find(options.removeCurrentSelector)
          if canRemoveForm()
            # Show remove current buttons of all forms
            removeCurrents.show()
          else
            removeCurrents.hide()
        else
          # Hide all
          removeCurrents = source.find(options.removeCurrentSelector)
          removeCurrents.hide()
      else
        removeLast.hideIf()
        removeAll.hideIf()
      # Add button
      if !canAddForm()
        add.hideIf()
        addN.hideIf()
      else
        add.showIf()
        addN.showIf()
      # Remove buttons only enabled when can remove forms
      if !canRemoveForm()
        removeLast.hideIf()
        removeAll.hideIf()
      if add.css('display') != 'none' or addN.css('display') != 'none' or removeAll.css('display') != 'none' or removeLast.css('display') != 'none'
        controls.show()
      else
        controls.hide()
      return

    ###*
    # Show/hide noFormsMsg
    ###

    normalizeForms = ->
      if hasForms()
        noFormsTemplate.hide()
        if options.continuousIndex
          index = 0
          form = getFirstForm()
          loop
            normalizeForm form, index
            index++
            form = getNextForm(form)
            unless form != false
              break
      else
        noFormsTemplate.show()
      return

    normalizeForm = (form, index) ->
      if typeof index == 'undefined'
        index = getIndex()
      idTemplate = getOrSetTemplate(form, 'id')
      # Normalize form id
      if form.attr('id')
        form.attr 'id', idTemplate + index
      # Normalize indexes for fields name and id attributes
      normalizeFieldsForForm form, index
      # Normalize labels
      normalizeLabelsForForm form, index
      # Normalize other possibles indexes inside html
      if form.html().indexOf(options.indexFormat) != -1
        # Create a javascript regular expression object
        re = new RegExp(options.indexFormat, 'ig')
        # Replace all index occurrences inside the html
        form.html form.html().replace(re, index)
      # Remove current form control
      removeCurrent = form.find(options.removeCurrentSelector)
      if options.allowRemoveCurrent then removeCurrent.show() else removeCurrent.hide()
      form

    ###*
    # Normalize all (Controls, Forms)
    ###

    normalizeAll = ->
      normalizeForms()
      normalizeControls()
      return

    ###*
    # Add a new form to the collection
    # 
    # @parameter normalize: avoid normalize all forms if not necessary
    ###

    addForm = (normalizeAllafterAdd, form) ->
      if typeof normalizeAllafterAdd == 'undefined'
        normalizeAllafterAdd = true
      if typeof form == 'undefined'
        form = false
      # Before add callBack function
      if typeof options.beforeAdd == 'function'
        options.beforeAdd source
      newForm = false
      # Pre-generated form
      if form
        if typeof form == 'string'
          newForm = $('#' + form)
        else if typeof form == 'object'
          newForm = form
        else
          return false
        newForm.remove()
      else
        # Get template clone
        newForm = cloneTemplate()
      if canAddForm() and newForm
        newForm = normalizeForm(newForm)
        # Remove current control
        removeCurrentBtn = newForm.find(options.removeCurrentSelector).first()
        removeCurrentBtn.click clickOnRemoveCurrent
        removeCurrentBtn.data 'removableClone', newForm
        # Index
        newForm.data 'formIndex', getIndex()
        # Linked references (separators and forms)
        newForm.data 'previousSeparator', false
        newForm.data 'nextSeparator', false
        newForm.data 'previousForm', false
        newForm.data 'nextForm', false
        # Link references?
        if hasForms()
          lastForm = getLastForm()
          # Form references
          lastForm.data 'nextForm', newForm
          newForm.data 'previousForm', lastForm
          # Separator references
          if options.separator
            separator = getSeparator()
            separator.insertAfter lastForm
            lastForm.data 'nextSeparator', separator
            newForm.data 'previousSeparator', separator
        if options.insertNewForms == 'after' then newForm.insertBefore(noFormsTemplate) else newForm.insertAfter(noFormsTemplate)
        # Nested forms
        if options.nestedForms.length > 0
          x = 0
          nestedForms = []
          for x of options.nestedForms
            `x = x`
            if typeof options.nestedForms[x].id != 'undefined' and typeof options.nestedForms[x].options != 'undefined'
              options.nestedForms[x].isNestedForm = true
              options.nestedForms[x].parentForm = source
              id = options.nestedForms[x].id.replace(options.indexFormat, newForm.data('formIndex'))
              nestedForm = $('#' + id).sheepIt(options.nestedForms[x].options)
              nestedForms.push nestedForm
          newForm.data 'nestedForms', nestedForms
        extendForm newForm
        forms.push newForm

        ###*
        # If index has to be continuous,
        # all items are reindexed/renumbered using 
        # normalizeAll() after add a new form clone
        ###

        if normalizeAllafterAdd or options.continuousIndex
          normalizeAll()
        # After add callBack function
        if typeof options.afterAdd == 'function'
          options.afterAdd source, newForm
        true
      else
        false

    addNForms = (n, normalize) ->
      if typeof n != 'undefined'
        n = parseFloat(n)
        x = 1
        x = 1
        while x <= n
          addForm normalize
          x++
      return

    removeLastForm = (normalize) ->
      if typeof normalize == 'undefined'
        normalize = true
      if canRemoveForm()
        removeForm()
        if normalize
          normalizeAll()
        true
      else
        false

    removeAllForms = (normalize) ->
      if typeof normalize == 'undefined'
        normalize = true
      if canRemoveAllForms()
        x = []
        for x of forms
          `x = x`
          if forms[x]
            removeForm forms[x]
        if normalize
          normalizeAll()
        true
      else
        false

    removeCurrentForm = (formToRemove, normalize) ->
      if typeof normalize == 'undefined'
        normalize = true
      if canRemoveForm()
        removeForm formToRemove
        if normalize
          normalizeAll()
        true
      else
        false

    ###*
    # Remove form from the index and DOM
    ###

    removeForm = (formToRemove) ->
      # If no form provided then remove the last one
      if typeof formToRemove == 'undefined'
        formToRemove = getLastForm()
      index = formToRemove.data('formIndex')

      ###*
      # Remove separator?
      ###

      # Two
      if formToRemove.data('previousSeparator') and formToRemove.data('nextSeparator')
        formToRemove.data('previousSeparator').remove()
        formToRemove.data('previousForm').data 'nextSeparator', formToRemove.data('nextSeparator')
      else if formToRemove.data('previousSeparator') and !formToRemove.data('nextSeparator')
        formToRemove.data('previousSeparator').remove()
        formToRemove.data('previousForm').data 'nextSeparator', false
      else if !formToRemove.data('previousSeparator') and formToRemove.data('nextSeparator')
        formToRemove.data('nextSeparator').remove()
        formToRemove.data('nextForm').data 'previousSeparator', false
      # Update forms references
      if formToRemove.data('previousForm')
        formToRemove.data('previousForm').data 'nextForm', formToRemove.data('nextForm')
      if formToRemove.data('nextForm')
        formToRemove.data('nextForm').data 'previousForm', formToRemove.data('previousForm')
      # From index
      forms[index] = false
      # From DOM
      formToRemove.remove()
      true

    ###---------------- ITERATOR METHODS ----------------###

    ###*
    # Gets the current internal pointer
    ###

    current = ->
      ip
      # false or integer

    ###*
    # Increment the internal pointer
    ###

    next = ->
      if ip != false
        if forms.length > 1
          i = 0
          init = parseFloat(ip + 1)
          i = init
          while i < forms.length
            if forms[i]
              ip = i
              return true
            i++
          false
        else
          false
      else
        false

    ###*
    # Decrement the internal pointer
    ###

    previous = ->
      if ip != false
        if forms.length > 1
          i = 0
          init = parseFloat(ip - 1)
          i = init
          while i >= 0
            if forms[i]
              ip = i
              return true
            i--
          false
        else
          false
      else
        false

    ###*
    # Brings the internal pointer to the first element
    ###

    first = ->
      ip = false
      if forms.length > 0
        x = 0
        for x of forms
          `x = x`
          if forms[x]
            ip = x
            return true
        false
      else
        false

    ###*
    # Brings the internal pointer to the last element
    ###

    last = ->
      ip = false
      if forms.length > 0
        if forms[forms.length - 1]
          ip = forms.length - 1
          true
        else
          i = 0
          i = forms.length - 1
          while i >= 0
            if forms[i]
              ip = i
              return true
            i--
          false
      else
        false

    ###*
    # Count the current elements
    ###

    count = ->
      `var count`
      if forms.length > 0
        count = 0
        x = []
        for x of forms
          `x = x`
          if forms[x]
            count++
        count
      else
        0

    ###*
    # Sets the pointer to a new position
    ###

    setPointerTo = (position) ->
      if typeof position != 'undefined'
        ip = getIndexForPosition(position)
        if ip != false
          true
        else
          false
      else
        false

    ###*
    # Get the "real" index for a given position
    ###

    getIndexForPosition = (position) ->
      `var count`
      x = 0
      count = 0
      index = false
      for x of forms
        `x = x`
        if forms[x]
          count++
          # get index for position
          if position == count
            index = x
      index

    getPositionForIndex = (index) ->
      x = 0
      position = 0
      x = 0
      while x <= index
        if forms[x]
          position++
        x++
      position

    ###*
    # Get the current index (Forms array length)
    ###

    getIndex = ->
      forms.length

    ###---------------- /ITERATOR METHODS ----------------###

    getFormsCount = ->
      count()

    getFirstForm = ->
      if first() != false
        getCurrentForm()
      else
        false

    getLastForm = ->
      if last() != false
        getCurrentForm()
      else
        false

    getNextForm = (form) ->
      if form
        form.data 'nextForm'
      else if current() != false
        if next() != false
          getCurrentForm()
        else
          false
      else
        false

    getPreviousForm = (form) ->
      if form
        form.data 'previousForm'
      else if current() != false
        if previous() != false
          getCurrentForm()
        else
          false
      else
        false

    ###*
    # Get the current form based on the interal pointer
    ###

    getCurrentForm = ->
      if current() != false
        forms[current()]
      else
        false

    ###*
    # Get a form by its position
    ###

    getForm = (position) ->
      if hasForms()
        if typeof position != 'undefined'
          setPointerTo position
          getCurrentForm()
        else
          getLastForm()
      else
        false

    ###*
    # Get active forms
    ###

    getForms = ->
      if hasForms()
        first()
        x = 0
        activeForms = []
        x = 0
        while x < getFormsCount()
          activeForms.push getCurrentForm()
          next()
          x++
        activeForms
      else
        false

    hasForms = ->
      if getFormsCount() > 0 then true else false

    canAddForm = ->
      if options.maxFormsCount == 0
        true
      else
        if getFormsCount() < options.maxFormsCount then true else false

    ###*
    # Checks if can remove any form
    ###

    canRemoveForm = ->
      if getFormsCount() > options.minFormsCount then true else false

    canRemoveAllForms = ->
      if options.minFormsCount == 0 then true else false

    isInDom = (object) ->
      if $('#' + object.attr('id')).length > 0
        true
      else
        false

    ###*
    # Controls the whole process of data injection
    #
    ###

    fillData = (index, values) ->
      form = ''
      # Position
      if typeof index == 'number'
        # Correction of index to position
        index++
        # Need more forms?
        if index > getFormsCount()
          addForm()
        form = getForm(index)
        fillForm form, values
      else if typeof index == 'string'
        form = $('#' + index)
        fillForm form, values
      if typeof options.afterFill == 'function'
        options.afterFill source, form, values
      return

    fillForm = (form, data) ->
      x = 0
      # For each element, try to get the correct field or fields
      $.each data, (index, value) ->
        formId = source.attr('id')
        formIndex = form.data('formIndex')
        # Replace form Id and form Index with current values
        if index.indexOf('#form#') != -1 or index.indexOf('#index#') != -1
          index = index.replace('#form#', formId)
          index = index.replace('#index#', formIndex)
        else
          index = formId + '_' + formIndex + '_' + index

        ###*
        # Search for field (by id, by name, etc)
        ###

        # Search by id
        field = form.find(':input[id="' + index + '"]')
        # Search by name
        if field.length == 0
          # Search by name
          field = form.find(':input[name="' + index + '"]')
          if field.length == 0
            # Search by name array format
            field = form.find(':input[name="' + index + '[]"]')
        # Field was found
        if field.length > 0
          # Multiple values?
          mv = false
          if typeof value == 'object'
            mv = true
          # Multiple fields?
          mf = false
          if field.length > 1
            mf = true
          if mf
            if mv
              fieldsToFill = []
              fieldsToFill['fields'] = []
              fieldsToFill['values'] = []
              x = 0
              for x of value
                `x = x`
                fieldsToFill['fields'].push field.filter('[value="' + value[x] + '"]')
                fieldsToFill['values'].push value[x]
              x = 0
              for x of fieldsToFill['fields']
                `x = x`
                fillFormField fieldsToFill['fields'][x], fieldsToFill['values'][x]
            else
              fillFormField field.filter('[value="' + value + '"]', value)
          else
            if mv
              x = 0
              for x of value
                `x = x`
                fillFormField field, value[x]
            else
              fillFormField field, value
        else
          if typeof form.data('nestedForms') != 'undefined'
            if form.data('nestedForms').length > 0
              x = 0
              for x of form.data('nestedForms')
                `x = x`
                if index == form.data('nestedForms')[x].attr('id') and typeof value == 'object'
                  form.data('nestedForms')[x].inject value
        return
      return

    fillFormField = (field, value) ->
      type = field.attr('type')
      # hidden, text, password
      if type == 'text' or type == 'hidden' or type == 'password'
        field.attr 'value', value
        true
      else if type == 'textarea'
        field.text value
        true
      else if type == 'checkbox' or type == 'radio'
        field.attr 'checked', 'checked'
        true
      else if type == 'select-one' or type == 'select-multiple'
        field.find('option').each ->
          if $(this).text() == value or $(this).attr('value') == value
            $(this).attr 'selected', 'selected'
          return
        true
      else
        false

    hasSeparator = ->
      if options.separator != ''
        true
      else
        false

    getSeparator = ->
      if hasSeparator()
        $ options.separator
      else
        false

    setOptions = (newOptions) ->
      options = []
      options = $.extend(defaults, newOptions)
      normalizeOptions options
      return

    getOptions = ->
      options

    initialize = ->
      # Hide forms during initialization
      source.hide()

      ###*
      # Controls
      ###

      add = $(options.addSelector)
      addN = $(options.addNSelector)
      addNInput = $(options.addNInputSelector)
      addNButton = $(options.addNButtonSelector)
      removeLast = $(options.removeLastSelector)
      removeCurrent = $(options.removeCurrentSelector)
      removeAll = $(options.removeAllSelector)
      controls = $(options.controlsSelector)
      if add.length == 0
        options.allowAdd = false
      if addN.length == 0
        options.allowAddN = false
      if removeLast.length == 0
        options.allowRemoveLast = false
      if removeAll.length == 0
        options.allowRemoveAll = false
      # Extend basic controls with new methods used inside this plugin
      extendControl add, options.allowAdd, clickOnAdd
      extendControl addN, options.allowAddN, clickOnAddN, addNButton
      extendControl removeLast, options.allowRemoveLast, clickOnRemoveLast
      extendControl removeAll, options.allowRemoveAll, clickOnRemoveAll
      # Initialize controls
      add.init()
      addN.init()
      removeLast.init()
      removeAll.init()

      ###*
      # Templates
      ###

      templateForm = $(options.formTemplateSelector)
      noFormsTemplate = $(options.noFormsTemplateSelector)
      # Get the template for clonning
      template = templateForm.cloneWithAttribut(true)
      templateForm.remove()

      ###*
      # Forms initialization
      ###

      x = 0
      # Pregenerated forms
      if options.pregeneratedForms.length > 0
        x = 0
        for x of options.pregeneratedForms
          `x = x`
          addForm false, options.pregeneratedForms[x]
      # Initial forms
      if options.iniFormsCount > getFormsCount()
        x = 0
        b = options.iniFormsCount - getFormsCount()
        x = 1
        while x <= b
          addForm false
          x++

      ###*
      # Data injection
      ###

      if options.data
        source.inject options.data
      normalizeAll()
      source.show()
      return

    ###*
    # Extend passed control with new methods used by this plugin
    ###

    extendControl = (control, allowControlOption, onClickFunction, onClickSubControl) ->

      ###*
      # onClickSubControl es utilizado cuando el control principal no es el que recibe el click
      ###

      if typeof onClickSubControl == 'undefined'
        onClickSubControl = false
      $.extend control,
        hideIf: (duration, callback) ->
          if allowControlOption
            control.hide duration, callback
          return
        showIf: (duration, callback) ->
          if allowControlOption
            control.show duration, callback
          return
        init: ->
          if allowControlOption
            # Click event
            if onClickSubControl
              onClickSubControl.click onClickFunction
            else
              control.click onClickFunction
            control.show()
          else
            control.hide()
          return
      return

    ###*
    # Extends source object with many useful methods,
    # used to control sheepIt forms with javascript
    ###

    extendSource = (source) ->
      # API
      $.extend source,
        getAddControl: ->
          add
        getAddNControl: ->
          addN
        getRemoveLastControl: ->
          removeLast
        getRemoveAllControl: ->
          removeAll
        getOptions: ->
          getOptions()
        getOption: (option) ->
          options[option]
        setOption: (option, value) ->
          if typeof option != 'undefined' and typeof value != 'undefined'
            options[option] = value
            options[option]
          else
            false
        getForms: ->
          getForms()
        getAllForms: ->
          getForms()
        getForm: (val) ->
          if typeof val != 'undefined'
            val++
          getForm val
        getLastForm: ->
          getForm()
        getFirstForm: ->
          first()
          getCurrentForm()
        addForm: ->
          addForm()
        addNForms: (n) ->
          addNForms n
        getFormsCount: ->
          getFormsCount()
        hasForms: ->
          hasForms()
        canAddForm: ->
          canAddForm()
        canRemoveAllForms: ->
          canRemoveAllForms()
        canRemoveForm: ->
          canRemoveForm()
        removeAllForms: ->
          removeAllForms()
        removeLastForm: ->
          removeLastForm()
        removeFirstForm: ->
          first()
          removeForm getCurrentForm()
        removeForm: (val) ->
          if typeof val != 'undefined'
            val++
          removeForm getForm(val)
        inject: (data) ->
          # Loop over each data using a Proxy (function , context)
          $.each data, $.proxy(fillData, source)
          return
      return

    ###*
    # Extends cloned forms with many useful methods,
    # used to control each form with javascript
    ###

    extendForm = (form) ->
      # API
      $.extend form,
        setLabel: (newLabel) ->
          setLabelForForm form, newLabel
        getLabel: ->
          getLabelForForm form
        inject: (data) ->
          fillForm form, data
          return
        getNestedForms: ->
          form.data 'nestedForms'
        getNestedForm: (val) ->
          form.data('nestedForms')[val]
        getPosition: ->
          getPositionForIndex form.data('formIndex')
        getPreviousForm: ->
          getPreviousForm form
        getNextForm: ->
          getNextForm form
        removeForm: ->
          removeForm form
      return

    ###*
    # Normalize options
    ###

    normalizeOptions = (options) ->
      # Normalize limits options
      if options.maxFormsCount > 0
        if options.maxFormsCount < options.minFormsCount
          options.maxFormsCount = options.minFormsCount
        if options.iniFormsCount < options.minFormsCount or options.iniFormsCount > options.maxFormsCount
          options.iniFormsCount = options.minFormsCount
      else
        if options.iniFormsCount < options.minFormsCount
          options.iniFormsCount = options.minFormsCount
      if !canRemoveAllForms()
        options.allowRemoveAll = false
      return

    extendSource source
    add = undefined
    addN = undefined
    addNInput = undefined
    addNButton = undefined
    removeLast = undefined
    removeCurrent = undefined
    removeAll = undefined
    controls = undefined
    template = undefined
    templateForm = undefined
    noFormsTemplate = undefined
    formFields = 'input, checkbox, select, textarea'
    forms = []
    ip = false
    defaults = 
      addSelector: '#' + $(this).attr('id') + '_add'
      addNSelector: '#' + $(this).attr('id') + '_add_n'
      addNInputSelector: '#' + $(this).attr('id') + '_add_n_input'
      addNButtonSelector: '#' + $(this).attr('id') + '_add_n_button'
      removeLastSelector: '#' + $(this).attr('id') + '_remove_last'
      removeCurrentSelector: '#' + $(this).attr('id') + '_remove_current'
      removeAllSelector: '#' + $(this).attr('id') + '_remove_all'
      controlsSelector: '#' + $(this).attr('id') + '_controls'
      labelSelector: '#' + $(this).attr('id') + '_label'
      allowRemoveLast: true
      allowRemoveCurrent: true
      allowRemoveAll: false
      allowAdd: true
      allowAddN: false
      removeLastConfirmation: false
      removeCurrentConfirmation: false
      removeAllConfirmation: true
      removeLastConfirmationMsg: 'Are you sure?'
      removeCurrentConfirmationMsg: 'Are you sure?'
      removeAllConfirmationMsg: 'Are you sure?'
      formTemplateSelector: '#' + $(this).attr('id') + '_template'
      noFormsTemplateSelector: '#' + $(this).attr('id') + '_noforms_template'
      separator: '<div style="width:100%; border-top:1px solid #ff0000; margin: 10px 0px;"></div>'
      iniFormsCount: 1
      maxFormsCount: 20
      minFormsCount: 1
      incrementCount: 1
      noFormsMsg: 'No forms to display'
      indexFormat: '#index#'
      data: []
      pregeneratedForms: []
      nestedForms: []
      isNestedForm: false
      parentForm: {}
      beforeClone: ->
      afterClone: ->
      beforeAdd: ->
      afterAdd: ->
      afterFill: ->
      afterRemoveCurrent: ->
      beforeRemoveCurrent: ->
      insertNewForms: 'after'
      continuousIndex: true
    setOptions options
    initialize()
    source

  ###*
  # JQuery original clone method decorated in order to fix an IE < 8 issue
  # where attributs especially name are not copied
  ###

  jQuery.fn.cloneWithAttribut = (withDataAndEvents) ->
    if jQuery.support.noCloneEvent
      $(this).clone withDataAndEvents
    else
      $(this).find('*').each ->
        $(this).data 'name', $(this).attr('name')
        return
      clone = $(this).clone(withDataAndEvents)
      clone.find('*').each ->
        $(this).attr 'name', $(this).data('name')
        return
      clone

  return
) jQuery