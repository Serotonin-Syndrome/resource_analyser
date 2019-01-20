package raid.hack.crypto.fantom;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
public class StaticContentController {

  @GetMapping(value = {"/development"})
  public String developmentPage(Model model) {
    model.addAttribute("scripts", List.of("development-page.js"));
    model.addAttribute("markup", "development-page.html");
    return "index";
  }

  @GetMapping(value = {"/", "/index.*", "/gas-usage", "/index"})
  public String gasUsagePage(Model model) {
    model.addAttribute("scripts", List.of("gas-usage-page.js"));
    model.addAttribute("markup", "gas-usage-page.html");
    model.addAttribute("disableConsole", true);
    return "index";
  }

}
