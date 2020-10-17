from django import template

register = template.Library()

@register.filter(name='money')
def money_format(value):
    try:
        output = value
        if value > 1000000000:
            output = f'{value/10000000000:.3g} B'
        elif value > 1000000:
            output = f'{value/1000000:.3g} M'
        elif output > 1000:
            output = f'{value/1000:.3g} K'
    except TypeError:
        output = value

    return output
