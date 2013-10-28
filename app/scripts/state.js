// Generated by CoffeeScript 1.6.3
(function() {
  angular.module('ldApp').factory('state', [
    'command', 'configState', 'DataDisassemblyParsers', function(command, configState, parsers) {
      var TLBEntrySize, state;
      TLBEntrySize = configState.TLBEntrySize;
      return state = {
        registers: {
          '': ''
        },
        memory: {
          /*
          */

          TLB: {}
        },
        getMemory: function(addr) {
          if (state.memory.TLB[addr >>> TLBEntrySize] != null) {
            return state.memory.TLB[addr >>> TLBEntrySize].content[addr];
          } else {
            return command.commandExecO(configState.getMemoryCommand(addr)).then(function(contentPulled) {
              return state.memory.TLB[addr >>> TLBEntrySize] = {
                content: parsers[configState.architecture].disassemblyParser(contentPulled).instructions,
                dirty: 0
              };
            });
          }
        }
      };
    }
  ]);

}).call(this);
