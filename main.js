function atAutocomplete(elId, url, delay = 300) {
    const fetchData = _.debounce(function (url, data, fn) {
        $.getJSON(url, data, fn)
    }, delay)

    const $valEl = $(`#${elId}`);
    const html = `
        <div class="ac-container">
            <input class="form-control" id="${elId}-filter" role="combobox" aria-controls="${elId}-dropdow" aria-expanded="false" aria-autocomplete="list">
            <ul class="dd-menu" id="${elId}-dropdown" role="listbox" hidden>
                <li class="dropdown-item" role="option"></li>
            </ul>
        </div>`
    $valEl.after(html);

    const $filter = $(`#${elId}-filter`);
    const $ddm = $(`#${elId}-dropdown`);
    let $selectedEl = null;
    let $menuItems = [];

    function selectItem($el) {
        $filter.val($el.text());
        
        if ($selectedEl && $selectedEl[0] == $el[0]) {
            $ddm.attr('hidden', true);
            $filter.attr('aria-expanded', 'false');
            $filter.trigger('focus');
            return;
        }

        $valEl.html(
            `<option value="${parseInt($el.attr('data-id'))}" selected></option>`
        );

        $el.addClass('selected');
        if ($selectedEl) {
            $selectedEl.attr('aria-selected', 'false');
            $selectedEl.removeClass('selected');
        }
        $selectedEl = $el;
        $selectedEl.attr('aria-selected', 'true');
        $ddm.attr('hidden', true);
        $filter.attr('aria-expanded', 'false');
        $filter.trigger('focus');
    }

    function handleApiData(data) {
        $ddm.html('');
        $valEl.html('');
        $selectedEl = null;

        if (data.length === 0) {
            $ddm.html(`<div style="font-weight: 600;">Found nothing.</div>`);
            return;
        }

        $.each(data, function (idx, val) {
            $('<li>')
                .addClass('dropdown-item')
                .attr({
                    role: 'option',
                    'data-id': val.id,
                    'data-idx': idx,
                    tabIndex: 0,
                    id: 'ac-option-' + idx,
                    'aria-selected': 'false',
                })
                .text(val.name)
                .appendTo($ddm)
        });

        $ddm.attr('hidden', false);
        $filter.attr("aria-expanded", "true");
        $menuItems = $(`#${elId}-filter + .dd-menu .dropdown-item`);
    }

    $('html').on('click', function () {
        if (this !== $ddm[0]) $ddm.attr('hidden', true);
    })

    $ddm.on('click', '.dropdown-item', function () {
        selectItem($(this));
    });

    $filter.on('input', function () {
        if (this.value.length < 3) return;
        fetchData(url, { term: this.value }, handleApiData);
    });

    $filter.on('keyup', function (e) {
        if (e.key === 'ArrowDown' && $menuItems.length) {
            $ddm.removeAttr('hidden');
            if ($selectedEl) {
                const idx = parseInt($selectedEl.attr('data-idx'));
                if ($menuItems.length - 1 > idx) {
                    $menuItems.eq(idx + 1).trigger('focus');
                } else {
                    $menuItems.eq(0).trigger('focus');
                }
            } else {
                $menuItems.eq(0).trigger('focus');
            }
            $filter.attr('aria-activedescendant', 'ac-option-0');
        }
    })

    $ddm.on('keyup', '.dropdown-item', function (e) {
        if (e.key === 'ArrowDown') {
            const idx = parseInt(
                $ddm.find('.dropdown-item:focus').attr('data-idx')
            );
            if ($menuItems.length - 1 > idx) {
                $menuItems.eq(idx + 1).trigger('focus')
                $filter.attr('aria-activedescendant', `ac-option-${idx + 1}`);
            } else {
                $menuItems.eq(0).trigger('focus');
                $filter.attr('aria-activedescendant', 'ac-option-0');
            }
        }
        if (e.key === 'ArrowUp') {
            const idx = parseInt(
                $ddm.find('.dropdown-item:focus').attr('data-idx')
            );
            if (idx > 0) {
                $menuItems.eq(idx - 1).trigger('focus')
                $filter.attr('aria-activedescendant', `ac-option-${idx - 1}`);
            } else {
                $menuItems.eq($menuItems.length - 1).trigger('focus');
                $filter.attr(
                    'aria-activedescendant',
                    `ac-option-${$menuItems.length - 1}`
                );
            }
        }
        if (e.key === 'Enter') selectItem($(this))
    })
}

if (document.getElementById('ac')) {
    atAutocomplete('name', './data.json');
}
