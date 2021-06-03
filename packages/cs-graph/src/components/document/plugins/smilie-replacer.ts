import { Extension } from '@tiptap/core'
import { InputRule } from 'prosemirror-inputrules'

export const SmilieReplacer = Extension.create({
  name: 'smilieReplacer',

  addInputRules() {
    return [
      new InputRule(/-___- /, '😑 '),
      new InputRule(/:'-\) /, '😂 '),
      new InputRule(/':-\) /, '😅 '),
      new InputRule(/':-D /, '😅 '),
      new InputRule(/>:-\) /, '😆 '),
      new InputRule(/-__- /, '😑 '),
      new InputRule(/':-\( /, '😓 '),
      new InputRule(/:'-\( /, '😢 '),
      new InputRule(/>:-\( /, '😠 '),
      new InputRule(/O:-\) /, '😇 '),
      new InputRule(/0:-3 /, '😇 '),
      new InputRule(/0:-\) /, '😇 '),
      new InputRule(/0;\^\) /, '😇 '),
      new InputRule(/O;-\) /, '😇 '),
      new InputRule(/0;-\) /, '😇 '),
      new InputRule(/O:-3 /, '😇 '),
      new InputRule(/:'\) /, '😂 '),
      new InputRule(/:-D /, '😃 '),
      new InputRule(/':\) /, '😅 '),
      new InputRule(/'=\) /, '😅 '),
      new InputRule(/':D /, '😅 '),
      new InputRule(/'=D /, '😅 '),
      new InputRule(/>:\) /, '😆 '),
      new InputRule(/>;\) /, '😆 '),
      new InputRule(/>=\) /, '😆 '),
      new InputRule(/;-\) /, '😉 '),
      new InputRule(/\*-\) /, '😉 '),
      new InputRule(/;-\] /, '😉 '),
      new InputRule(/;\^\) /, '😉 '),
      new InputRule(/B-\) /, '😎 '),
      new InputRule(/8-\) /, '😎 '),
      new InputRule(/B-D /, '😎 '),
      new InputRule(/8-D /, '😎 '),
      new InputRule(/:-\* /, '😘 '),
      new InputRule(/:\^\* /, '😘 '),
      new InputRule(/:-\) /, '🙂 '),
      new InputRule(/-_- /, '😑 '),
      new InputRule(/:-X /, '😶 '),
      new InputRule(/:-# /, '😶 '),
      new InputRule(/:-x /, '😶 '),
      new InputRule(/>.< /, '😣 '),
      new InputRule(/:-O /, '😮 '),
      new InputRule(/:-o /, '😮 '),
      new InputRule(/O_O /, '😮 '),
      new InputRule(/>:O /, '😮 '),
      new InputRule(/:-P /, '😛 '),
      new InputRule(/:-p /, '😛 '),
      new InputRule(/:-Þ /, '😛 '),
      new InputRule(/:-þ /, '😛 '),
      new InputRule(/:-b /, '😛 '),
      new InputRule(/>:P /, '😜 '),
      new InputRule(/X-P /, '😜 '),
      new InputRule(/x-p /, '😜 '),
      new InputRule(/':\( /, '😓 '),
      new InputRule(/'=\( /, '😓 '),
      new InputRule(/>:\\ /, '😕 '),
      new InputRule(/>:\/ /, '😕 '),
      new InputRule(/:-\/ /, '😕 '),
      new InputRule(/:-. /, '😕 '),
      new InputRule(/>:\[ /, '😞 '),
      new InputRule(/:-\( /, '😞 '),
      new InputRule(/:-\[ /, '😞 '),
      new InputRule(/:'\( /, '😢 '),
      new InputRule(/;-\( /, '😢 '),
      new InputRule(/#-\) /, '😵 '),
      new InputRule(/%-\) /, '😵 '),
      new InputRule(/X-\) /, '😵 '),
      new InputRule(/>:\( /, '😠 '),
      new InputRule(/0:3 /, '😇 '),
      new InputRule(/0:\) /, '😇 '),
      new InputRule(/O:\) /, '😇 '),
      new InputRule(/O=\) /, '😇 '),
      new InputRule(/O:3 /, '😇 '),
      new InputRule(/<\/3 /, '💔 '),
      new InputRule(/:D /, '😃 '),
      new InputRule(/=D /, '😃 '),
      new InputRule(/;\) /, '😉 '),
      new InputRule(/\*\) /, '😉 '),
      new InputRule(/;\] /, '😉 '),
      new InputRule(/;D /, '😉 '),
      new InputRule(/B\) /, '😎 '),
      new InputRule(/8\) /, '😎 '),
      new InputRule(/:\* /, '😘 '),
      new InputRule(/=\* /, '😘 '),
      new InputRule(/:\) /, '🙂 '),
      new InputRule(/=\] /, '🙂 '),
      new InputRule(/=\) /, '🙂 '),
      new InputRule(/:\] /, '🙂 '),
      new InputRule(/:X /, '😶 '),
      new InputRule(/:# /, '😶 '),
      new InputRule(/=X /, '😶 '),
      new InputRule(/=x /, '😶 '),
      new InputRule(/:x /, '😶 '),
      new InputRule(/=# /, '😶 '),
      new InputRule(/:O /, '😮 '),
      new InputRule(/:o /, '😮 '),
      new InputRule(/:P /, '😛 '),
      new InputRule(/=P /, '😛 '),
      new InputRule(/:p /, '😛  '),
      new InputRule(/=p /, '😛 '),
      new InputRule(/:Þ /, '😛 '),
      new InputRule(/:þ /, '😛 '),
      new InputRule(/:b /, '😛 '),
      new InputRule(/d: /, '😛 '),
      new InputRule(/:\/ /, '😕 '),
      new InputRule(/:\\ /, '😕 '),
      new InputRule(/=\/ /, '😕 '),
      new InputRule(/=\\ /, '😕 '),
      new InputRule(/:L /, '😕 '),
      new InputRule(/=L /, '😕 '),
      new InputRule(/:\( /, '😞 '),
      new InputRule(/:\[ /, '😞 '),
      new InputRule(/=\( /, '😞 '),
      new InputRule(/;\( /, '😢 '),
      new InputRule(/D: /, '😨 '),
      new InputRule(/:\$ /, '😳 '),
      new InputRule(/=\$ /, '😳 '),
      new InputRule(/#\) /, '😵 '),
      new InputRule(/%\) /, '😵 '),
      new InputRule(/X\) /, '😵 '),
      new InputRule(/:@ /, '😠 '),
      new InputRule(/<3 /, '❤️ '),
      new InputRule(/\/shrug/, '¯\\_(ツ)_/¯'),
    ]
  },
})