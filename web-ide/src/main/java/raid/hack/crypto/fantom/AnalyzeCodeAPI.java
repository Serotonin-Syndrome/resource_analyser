package raid.hack.crypto.fantom;


import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import raid.hack.crypto.fantom.response.ExecutionResponse;

import java.io.*;
import java.util.Arrays;

import static raid.hack.crypto.fantom.CompilationAPI.SUPPORTED_FORMATS;

@RestController
public class AnalyzeCodeAPI {
  private static final String LLIIC_PATH = "../playground/run";
  private static final String PLAYGROUND_PATH = "../playground/";

  @PostMapping("/api/run-count-operations")
  public ExecutionResponse runCountOperations(@RequestParam(value = "code") String code,
                                              @RequestParam(value = "format") String format) {

    if (Arrays.stream(SUPPORTED_FORMATS).noneMatch(format::equals)) {
      return null;
    }

    String id = CoderHelper.nextIdentifier();
    File file = writeFile(id, format, code);
    ExecutionResponse resp = execute(file);
    cleanUp(file);
    return resp;
  }


  private File writeFile(String fileId, String format, String code) {
    File file = new File(PLAYGROUND_PATH, fileId + "." + format);
    try (var writer = new BufferedWriter(new FileWriter(file))) {
      writer.write(code);
    } catch (IOException exc) {
      exc.printStackTrace();
    }
    return file;
  }

  private void cleanUp(File file) {
    file.delete();
  }

  private ExecutionResponse execute(File file) {
    try {
      return ExecutionController.runAndJoin("sudo", "-u", "unsafe", LLIIC_PATH, file.getAbsolutePath());
    } catch (InterruptedException exc) {
      return null;
    }
  }
}
