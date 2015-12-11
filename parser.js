/*jshint esnext: true */
module.exports = {
  getCommentSections: function(contents) {
    var sections = [];
    var parts = contents.split(/\/\*\*/g);
    for (var i=0; i<parts.length; i++) {
      var endCommentLocation = parts[i].indexOf("*/");
      if (endCommentLocation > -1) {
        sections.push(parts[i].substring(0, endCommentLocation));
      }
    }
    return sections;
  },
  clean: function(line) {
    return line.replace(/\s\*\s/gm, "").trim();
  },
  addClassCore: function(cls, comment, filename) {
    var rgx = /[\s\S]*@class ([a-zA-Z\.]+)[\s\S]*@extends ([a-zA-Z\.]+)([\s\S]*)@example([\s\S]*)/gm;
    var props = rgx.exec(comment);
    if (props && props.length === 5) {
      cls.name = this.clean(props[1]);
      cls.ext = this.clean(props[2]);
      cls.comments = this.clean(props[3]);
      cls.example = this.clean(props[4]);
    } else {
      process.stderr.write(filename + " : couldn't find all core properties @class, @extends, @example... missing something?\n");
    }
    return cls;
  },
  addClassProp: function(cls, comment, filename) {
    var rgx = /@prop \{([^\}]*)\} ([^\s]*) \[(.*)\]([\s\S]*)/gm;
    var props = rgx.exec(comment);
    if (props && props.length === 5) {
      if (!cls.properties) {
        cls.properties = [];
      }
      cls.properties.push({
        name: this.clean(props[1]),
        type: this.clean(props[2]),
        def: this.clean(props[3]),
        comments: this.clean(props[4])
      });
    }
    return cls;
  },
  parse: function(contents, filename) {
    if (contents.indexOf("@class") < 0) return undefined;
    var comments = this.getCommentSections(contents);
    var cls = {};
    for (var i=0; i<comments.length; i++) {
      var comment = comments[i];
      if (comment.indexOf("@class") > -1) {
        cls = this.addClassCore(cls, comment, filename);
      } else if (comment.indexOf("@prop") > -1) {
        cls = this.addClassProp(cls, comment, filename);
      }
    }
    return cls;
  }

};
