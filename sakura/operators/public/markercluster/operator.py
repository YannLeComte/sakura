#!/usr/bin/env python
from sakura.daemon.processing.operator import Operator
from sakura.daemon.processing.parameter import NumericColumnSelection

class MarkerClusterOperator(Operator):
    NAME = "MarkerCluster"
    SHORT_DESC = "Map of marker clusters."
    TAGS = [ "geo" ]
    def construct(self):
        # inputs
        self.input = self.register_input('Mean input data')
        # outputs
        output = self.register_output('Mean result', self.compute)
        output.add_column('Mean', float)
        output.length = 1
        # parameters
        self.input_column = self.register_parameter('Input column',
                NumericColumnSelection(self.input))
    def compute(self):
        res = 0
        num = 0
        idx = self.input_column.index
        for row in self.input:
            res += row[idx]
            num += 1
        return ((float(res)/num,),)
