package raid.hack.crypto.fantom;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.AbstractRequestLoggingFilter;

import javax.servlet.http.HttpServletRequest;

@Configuration
public class RequestLoggingConfigurator {

  @Bean
  public AbstractRequestLoggingFilter getLoggingFilter() {
    return new AbstractRequestLoggingFilter() {
      {
        setIncludeQueryString(false);
        setIncludeClientInfo(true);
        setIncludeHeaders(false);
        setIncludePayload(false);
        setBeforeMessagePrefix("__IP_History[");
        setBeforeMessageSuffix("]__");
      }

      @Override
      protected boolean shouldLog(HttpServletRequest request) {
        return logger.isInfoEnabled();
      }

      @Override
      protected void beforeRequest(HttpServletRequest request, String message) {
        logger.info(message);
      }

      @Override
      protected void afterRequest(HttpServletRequest request, String message) {
      }
    };
  }

}
