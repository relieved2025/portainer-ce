import moment from 'moment';

import { concatLogsToString, NEW_LINE_BREAKER } from '@/docker/helpers/logHelper';

angular.module('portainer.docker').controller('LogViewerController', [
  '$scope',
  'clipboard',
  'Blob',
  'FileSaver',
  function ($scope, clipboard, Blob, FileSaver) {
    this.state = {
      availableSinceDatetime: [
        { desc: '昨天', value: moment().subtract(1, 'days').format() },
        { desc: '最近4小时', value: moment().subtract(4, 'hours').format() },
        { desc: '最近1小时', value: moment().subtract(1, 'hours').format() },
        { desc: '最近10分钟', value: moment().subtract(10, 'minutes').format() },
      ],
      copySupported: clipboard.supported,
      logCollection: true,
      autoScroll: true,
      wrapLines: true,
      search: '',
      filteredLogs: [],
      selectedLines: [],
    };

    this.handleLogsCollectionChange = handleLogsCollectionChange.bind(this);
    this.handleLogsWrapLinesChange = handleLogsWrapLinesChange.bind(this);
    this.handleDisplayTimestampsChange = handleDisplayTimestampsChange.bind(this);

    function handleLogsCollectionChange(enabled) {
      $scope.$evalAsync(() => {
        this.state.logCollection = enabled;
        this.state.autoScroll = enabled;
        this.logCollectionChange(enabled);
      });
    }

    function handleLogsWrapLinesChange(enabled) {
      $scope.$evalAsync(() => {
        this.state.wrapLines = enabled;
      });
    }

    function handleDisplayTimestampsChange(enabled) {
      $scope.$evalAsync(() => {
        this.displayTimestamps = enabled;
      });
    }

    this.copy = function () {
      clipboard.copyText(this.state.filteredLogs.map((log) => log.line).join(NEW_LINE_BREAKER));
      $('#refreshRateChange').show();
      $('#refreshRateChange').fadeOut(2000);
    };

    this.copySelection = function () {
      clipboard.copyText(this.state.selectedLines.join(NEW_LINE_BREAKER));
      $('#refreshRateChange').show();
      $('#refreshRateChange').fadeOut(2000);
    };

    this.clearSelection = function () {
      this.state.selectedLines = [];
    };

    this.selectLine = function (line) {
      var idx = this.state.selectedLines.indexOf(line);
      if (idx === -1) {
        this.state.selectedLines.push(line);
      } else {
        this.state.selectedLines.splice(idx, 1);
      }
    };

    this.downloadLogs = function () {
      const logsAsString = concatLogsToString(this.state.filteredLogs);
      const data = new Blob([logsAsString]);
      FileSaver.saveAs(data, this.resourceName + '_logs.txt');
    };
  },
]);
